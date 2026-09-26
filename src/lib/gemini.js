/**
 * Gemini AI Client
 * 
 * Initializes and exports the Google Gemini AI client for server-side use.
 * Features automatic model fallbacks and retry logic for high availability.
 */

import { GoogleGenAI } from '@google/genai';
import { extractFileContent } from '../utils/fileHelpers.js';

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY environment variable is not set. ' +
    'Get your API key at https://aistudio.google.com/apikey and add it to .env.local'
  );
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/** Models in order of preference with automatic fallback */
export const AVAILABLE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export const MODEL_ID = AVAILABLE_MODELS[0];

/**
 * Execute a Gemini API call with model fallback and exponential backoff retry.
 * @param {Function} apiCallFactory - Function receiving modelId: (modelId) => Promise<result>
 * @param {number} retries - Max retries per model
 * @returns {Promise<*>}
 */
async function executeWithFallback(apiCallFactory, retries = 2) {
  let lastError = null;

  for (const modelId of AVAILABLE_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await apiCallFactory(modelId);
      } catch (error) {
        lastError = error;
        const status = error?.status || error?.httpStatusCode;
        const isOverload = status === 503 || status === 429;
        const isNotFound = status === 404;

        if (isNotFound) {
          // Model deprecated/not found -> immediately skip to next model
          break;
        }

        if (isOverload && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`Gemini API ${modelId} returned ${status}, retrying in ${Math.round(delay)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If overload persists on this model, break and try the next fallback model
        if (isOverload) {
          console.warn(`Gemini API ${modelId} overloaded, trying next fallback model...`);
          break;
        }

        throw error;
      }
    }
  }

  throw lastError || new Error('All Gemini AI models are currently unavailable.');
}

/**
 * Generate content using Gemini with text-only input.
 * @param {string} prompt - The text prompt
 * @param {object} [options] - Additional generation options
 * @returns {Promise<string>} The generated text response
 */
export async function generateText(prompt, options = {}) {
  const response = await executeWithFallback((model) =>
    genAI.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 8192,
        responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
      },
    })
  );

  return response.text;
}

/**
 * Generate content using Gemini with a document (PDF/text) input.
 * @param {string} prompt - The text prompt
 * @param {Buffer|Uint8Array} fileData - The document data
 * @param {string} mimeType - The MIME type of the document
 * @param {object} [options] - Additional generation options
 * @returns {Promise<string>} The generated text response
 */
export async function analyzeDocument(prompt, fileData, mimeType, options = {}) {
  if (mimeType === 'application/pdf') {
    const base64Data = Buffer.from(fileData).toString('base64');
    const response = await executeWithFallback((model) =>
      genAI.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'application/pdf',
                },
              },
            ],
          },
        ],
        config: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxTokens ?? 8192,
          responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
        },
      })
    );
    return response.text;
  } else {
    // For DOCX or text files, extract textual content first
    const { text } = await extractFileContent(fileData, mimeType);
    const fullPrompt = `${prompt}\n\n--- DOCUMENT CONTENT ---\n${text}\n--- END OF DOCUMENT ---`;
    return generateText(fullPrompt, options);
  }
}

/**
 * Analyze two documents together (for comparison).
 * @param {string} prompt - The comparison prompt
 * @param {Buffer|Uint8Array} fileData1 - First document data
 * @param {string} mimeType1 - First document MIME type
 * @param {Buffer|Uint8Array} fileData2 - Second document data
 * @param {string} mimeType2 - Second document MIME type
 * @param {object} [options] - Additional generation options
 * @returns {Promise<string>} The generated comparison
 */
export async function compareDocuments(prompt, fileData1, mimeType1, fileData2, mimeType2, options = {}) {
  const isBothPdf = mimeType1 === 'application/pdf' && mimeType2 === 'application/pdf';

  if (isBothPdf) {
    const base64Data1 = Buffer.from(fileData1).toString('base64');
    const base64Data2 = Buffer.from(fileData2).toString('base64');

    const response = await executeWithFallback((model) =>
      genAI.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data1, mimeType: 'application/pdf' } },
              { inlineData: { data: base64Data2, mimeType: 'application/pdf' } },
            ],
          },
        ],
        config: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxTokens ?? 8192,
          responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
        },
      })
    );
    return response.text;
  } else {
    // Extract text from both files
    const doc1 = await extractFileContent(fileData1, mimeType1);
    const doc2 = await extractFileContent(fileData2, mimeType2);
    const fullPrompt = `${prompt}\n\n--- DOCUMENT A CONTENT ---\n${doc1.text}\n--- END DOCUMENT A ---\n\n--- DOCUMENT B CONTENT ---\n${doc2.text}\n--- END DOCUMENT B ---`;
    return generateText(fullPrompt, options);
  }
}

/**
 * Stream chat generation with document context and automatic model fallback.
 * @param {Array<{role: string, content: string}>} messages - Clean chat messages
 * @param {string} systemInstruction - System prompt instructions
 * @param {Buffer|Uint8Array|null} [fileData] - Optional document context
 * @param {string|null} [mimeType] - Optional document MIME type
 * @returns {AsyncGenerator<string>} Yields text chunks
 */
export async function* streamChat(messages, systemInstruction = '', fileData = null, mimeType = null) {
  // Build clean message list
  const validMessages = messages
    .filter((m) => m && m.content && typeof m.content === 'string' && m.content.trim())
    .map((msg) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content.trim() }],
    }));

  // Ensure alternating user/model roles and ends with a user message
  const contents = [];
  for (let i = 0; i < validMessages.length; i++) {
    const current = validMessages[i];
    if (contents.length === 0) {
      if (current.role === 'user') contents.push(current);
    } else {
      const prev = contents[contents.length - 1];
      if (prev.role !== current.role) {
        contents.push(current);
      } else if (current.role === 'user') {
        // Merge consecutive user messages
        prev.parts[0].text += `\n\n${current.parts[0].text}`;
      }
    }
  }

  // Ensure at least one user message
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  // If document file is present
  let effectiveSystemInstruction = systemInstruction;
  if (fileData && mimeType) {
    if (mimeType === 'application/pdf') {
      const base64Data = Buffer.from(fileData).toString('base64');
      // Attach PDF to the first user turn
      contents[0].parts.unshift({
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf',
        },
      });
    } else {
      // Extract DOCX/TXT text into the system prompt context
      try {
        const { text } = await extractFileContent(fileData, mimeType);
        effectiveSystemInstruction = `${systemInstruction}\n\n--- DOCUMENT CONTEXT ---\n${text.slice(0, 50000)}\n--- END OF DOCUMENT CONTEXT ---`;
      } catch (err) {
        console.warn('Could not extract text for chat attachment:', err);
      }
    }
  }

  // Try models with fallback
  let responseStream = null;
  let lastError = null;

  for (const model of AVAILABLE_MODELS) {
    try {
      responseStream = await genAI.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: effectiveSystemInstruction || undefined,
          temperature: 0.4,
          maxOutputTokens: 4096,
        },
      });
      break; // Successfully started stream
    } catch (err) {
      lastError = err;
      console.warn(`Stream generation failed on ${model}, trying next model...`, err.message);
    }
  }

  if (!responseStream) {
    throw lastError || new Error('Failed to start streaming response from AI.');
  }

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

export default genAI;

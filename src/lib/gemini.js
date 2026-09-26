/**
 * Gemini AI Client
 * 
 * Initializes and exports the Google Gemini AI client for server-side use.
 * All AI interactions are routed through this module to ensure API key security.
 */

import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY environment variable is not set. ' +
    'Get your API key at https://aistudio.google.com/apikey and add it to .env.local'
  );
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/** Default model for all operations */
export const MODEL_ID = 'gemini-3.6-flash';

/**
 * Retry wrapper with exponential backoff for transient API errors.
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Max retries (default 3)
 * @returns {Promise<*>} Result from fn
 */
async function withRetry(fn, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = error?.status || error?.httpStatusCode;
      const isRetryable = status === 503 || status === 429 || status === 500;
      
      if (isRetryable && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`Gemini API error (${status}), retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

/**
 * Generate content using Gemini with text-only input.
 * @param {string} prompt - The text prompt
 * @param {object} [options] - Additional generation options
 * @returns {Promise<string>} The generated text response
 */
export async function generateText(prompt, options = {}) {
  const response = await withRetry(() => genAI.models.generateContent({
    model: MODEL_ID,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 8192,
      responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
    },
  }));

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
  const base64Data = Buffer.from(fileData).toString('base64');

  const response = await withRetry(() => genAI.models.generateContent({
    model: MODEL_ID,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
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
  }));

  return response.text;
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
  const base64Data1 = Buffer.from(fileData1).toString('base64');
  const base64Data2 = Buffer.from(fileData2).toString('base64');

  const response = await withRetry(() => genAI.models.generateContent({
    model: MODEL_ID,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data1,
              mimeType: mimeType1,
            },
          },
          {
            inlineData: {
              data: base64Data2,
              mimeType: mimeType2,
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
  }));

  return response.text;
}

/**
 * Stream content generation for chat-like interactions.
 * @param {Array} messages - Array of chat messages [{role, content}]
 * @param {Buffer|Uint8Array|null} fileData - Optional document context
 * @param {string|null} mimeType - Optional document MIME type
 * @returns {AsyncGenerator<string>} Yields text chunks
 */
export async function* streamChat(messages, fileData = null, mimeType = null) {
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Attach document context to the first user message if available
  if (fileData && mimeType && contents.length > 0) {
    const base64Data = Buffer.from(fileData).toString('base64');
    contents[0].parts.unshift({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  const response = await genAI.models.generateContentStream({
    model: MODEL_ID,
    contents,
    config: {
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

export default genAI;

/**
 * Chat API Route
 * 
 * POST /api/chat
 * Streaming chat endpoint for document Q&A.
 * Returns Server-Sent Events (SSE) stream.
 */

import { streamChat } from '@/lib/gemini';
import { sanitizeInput } from '@/lib/validators';
import { getChatSystemPrompt } from '@/lib/prompts';

// Allow up to 60 seconds on Vercel Serverless Functions for AI streaming responses
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const message = sanitizeInput(body.message);
    const history = Array.isArray(body.history) ? body.history : [];
    const documentContext = sanitizeInput(body.documentContext || '');
    const fileData = body.fileData || null;
    const fileMimeType = body.fileMimeType || null;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build the system prompt with document context
    const systemInstruction = getChatSystemPrompt(
      documentContext || 'No specific document context provided. Answer legal questions generally.'
    );

    // Build the chat messages history
    const chatMessages = [
      ...history
        .filter((msg) => msg && msg.content && typeof msg.content === 'string')
        .map((msg) => ({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
          content: msg.content,
        })),
      { role: 'user', content: message },
    ];

    // Decode file buffer if provided
    let fileBuffer = null;
    if (fileData) {
      fileBuffer = Buffer.from(fileData, 'base64');
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = streamChat(chatMessages, systemInstruction, fileBuffer, fileMimeType);

          for await (const chunk of generator) {
            if (chunk) {
              const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Chat stream error:', error);
          const userErrorMessage = error?.message?.includes('API key')
            ? 'Gemini API key is invalid or not configured.'
            : 'AI service experienced a temporary error. Please try again.';
          const errorData = `data: ${JSON.stringify({ error: userErrorMessage })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat message' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

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
    const history = body.history || [];
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
    const systemPrompt = getChatSystemPrompt(documentContext || 'No specific document context provided. Answer legal questions generally.');

    // Build the chat messages
    const chatMessages = [
      { role: 'user', content: systemPrompt },
      { role: 'assistant', content: 'I understand. I\'m ready to help you analyze and understand your legal document. What would you like to know?' },
      ...history.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Decode file data if provided
    let fileBuffer = null;
    if (fileData) {
      fileBuffer = Buffer.from(fileData, 'base64');
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = streamChat(chatMessages, fileBuffer, fileMimeType);
          
          for await (const chunk of generator) {
            const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = `data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

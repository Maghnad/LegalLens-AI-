/**
 * Contract Comparison API Route
 * 
 * POST /api/compare
 * Accepts two file uploads and returns AI-powered comparison analysis.
 */

import { NextResponse } from 'next/server';
import { compareDocuments, generateText } from '@/lib/gemini';
import { getComparisonPrompt } from '@/lib/prompts';
import { validateFile } from '@/lib/validators';
import { extractFileContent } from '@/utils/fileHelpers';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const fileA = formData.get('fileA');
    const fileB = formData.get('fileB');

    // Validate both files
    const validationA = validateFile(fileA);
    if (!validationA.valid) {
      return NextResponse.json(
        { success: false, error: `Document A: ${validationA.error}` },
        { status: 400 }
      );
    }

    const validationB = validateFile(fileB);
    if (!validationB.valid) {
      return NextResponse.json(
        { success: false, error: `Document B: ${validationB.error}` },
        { status: 400 }
      );
    }

    const bufferA = Buffer.from(await fileA.arrayBuffer());
    const bufferB = Buffer.from(await fileB.arrayBuffer());

    const prompt = getComparisonPrompt();

    let resultText;

    // If both are PDFs, send both to Gemini natively
    if (fileA.type === 'application/pdf' && fileB.type === 'application/pdf') {
      resultText = await compareDocuments(prompt, bufferA, fileA.type, bufferB, fileB.type, { jsonMode: true });
    } else {
      // Extract text from non-PDF files
      const contentA = await extractFileContent(bufferA, fileA.type);
      const contentB = await extractFileContent(bufferB, fileB.type);

      const textA = contentA.text || '[PDF Document - content analyzed by AI]';
      const textB = contentB.text || '[PDF Document - content analyzed by AI]';

      // If one is PDF, we need to handle mixed types
      if (fileA.type === 'application/pdf' || fileB.type === 'application/pdf') {
        // Send PDF(s) natively, text inline
        resultText = await compareDocuments(
          `${prompt}\n\n--- DOCUMENT A (${fileA.name}) ---\n${textA}\n--- END DOCUMENT A ---\n\n--- DOCUMENT B (${fileB.name}) ---\n${textB}\n--- END DOCUMENT B ---`,
          bufferA,
          fileA.type,
          bufferB,
          fileB.type,
          { jsonMode: true }
        );
      } else {
        const fullPrompt = `${prompt}\n\n--- DOCUMENT A (${fileA.name}) ---\n${textA}\n--- END DOCUMENT A ---\n\n--- DOCUMENT B (${fileB.name}) ---\n${textB}\n--- END DOCUMENT B ---`;
        resultText = await generateText(fullPrompt, { jsonMode: true });
      }
    }

    // Parse JSON response
    let result;
    try {
      let cleaned = resultText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      result = JSON.parse(cleaned.trim());
    } catch {
      result = { rawText: resultText };
    }

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error('Comparison error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message?.includes('API key')
          ? 'Gemini API key is not configured.'
          : 'Failed to compare documents. Please try again.',
      },
      { status: 500 }
    );
  }
}

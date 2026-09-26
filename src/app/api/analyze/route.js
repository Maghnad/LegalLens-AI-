/**
 * Document Analysis API Route
 * 
 * POST /api/analyze
 * Accepts a file upload and analysis type, returns AI-powered analysis.
 * 
 * Supported analysis types:
 * - simplify: Plain-English document simplification
 * - risk: Risk analysis and obligation extraction
 * - checklist: Actionable checklists generation
 * - lawyer-prep: Lawyer preparation briefing
 * - suggest-questions: Generate suggested Q&A questions
 */

import { NextResponse } from 'next/server';
import { analyzeDocument, generateText } from '@/lib/gemini';
import {
  getSimplifyPrompt,
  getRiskAnalysisPrompt,
  getChecklistPrompt,
  getLawyerPrepPrompt,
  getSuggestedQuestionsPrompt,
  getNegotiationPrompt,
} from '@/lib/prompts';
import { validateFile, sanitizeInput } from '@/lib/validators';
import { extractFileContent } from '@/utils/fileHelpers';

// Allow up to 60 seconds on Vercel Serverless Functions for AI document processing
export const maxDuration = 60;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const analysisType = sanitizeInput(formData.get('analysisType'));
    const readingLevel = sanitizeInput(formData.get('readingLevel')) || 'general';

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Validate analysis type
    const validTypes = ['simplify', 'risk', 'checklist', 'lawyer-prep', 'suggest-questions', 'negotiate'];
    if (!validTypes.includes(analysisType)) {
      return NextResponse.json(
        { success: false, error: `Invalid analysis type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Read file
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;

    // Get the appropriate prompt
    const promptMap = {
      'simplify': getSimplifyPrompt(readingLevel),
      'risk': getRiskAnalysisPrompt(),
      'checklist': getChecklistPrompt(),
      'lawyer-prep': getLawyerPrepPrompt(),
      'suggest-questions': getSuggestedQuestionsPrompt(),
      'negotiate': getNegotiationPrompt(),
    };

    const prompt = promptMap[analysisType];

    let resultText;

    // For PDFs, send directly to Gemini (it handles them natively)
    if (mimeType === 'application/pdf') {
      resultText = await analyzeDocument(prompt, buffer, mimeType, { jsonMode: true });
    } else {
      // For text-based files, extract content first
      const { text } = await extractFileContent(buffer, mimeType);
      const fullPrompt = `${prompt}\n\n--- DOCUMENT CONTENT ---\n${text}\n--- END OF DOCUMENT ---`;
      resultText = await generateText(fullPrompt, { jsonMode: true });
    }

    // Parse the JSON response
    let result;
    try {
      let cleaned = resultText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      result = JSON.parse(cleaned.trim());
    } catch {
      // If JSON parsing fails, return raw text
      result = { rawText: resultText };
    }

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error('Analysis error:', error);
    
    const errorMsg = error.message || '';
    const status = error?.status || error?.httpStatusCode;
    const isApiKeyError = errorMsg.includes('API key') || errorMsg.includes('GEMINI_API_KEY');
    const isOverloaded = status === 503 || status === 429 || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE');
    
    let userError;
    let httpStatus;
    
    if (isApiKeyError) {
      userError = 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.';
      httpStatus = 401;
    } else if (isOverloaded) {
      userError = 'The AI service is currently experiencing high demand. Please wait a moment and try again.';
      httpStatus = 503;
    } else {
      userError = 'Failed to analyze document. Please try again.';
      httpStatus = 500;
    }
    
    return NextResponse.json(
      { success: false, error: userError },
      { status: httpStatus }
    );
  }
}

/**
 * Zod Validation Schemas
 * 
 * Type-safe validation for all API inputs.
 * Ensures security by validating file types, sizes, and user input.
 */

import { z } from 'zod';

/** Maximum file size: 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types for document upload */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

/** Allowed file extensions */
export const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx'];

/**
 * Schema for file upload validation
 */
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(MAX_FILE_SIZE, `File size must be under ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
  type: z.string().refine(
    (type) => ALLOWED_MIME_TYPES.includes(type),
    { message: `File type must be one of: ${ALLOWED_EXTENSIONS.join(', ')}` }
  ),
});

/**
 * Schema for analysis API request
 */
export const analyzeRequestSchema = z.object({
  analysisType: z.enum(['simplify', 'risk', 'checklist', 'lawyer-prep', 'suggest-questions', 'negotiate']),
});

/**
 * Schema for comparison API request
 */
export const compareRequestSchema = z.object({
  // Validation happens on files in the FormData
});

/**
 * Schema for chat API request
 */
export const chatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be under 5000 characters'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).max(50, 'Chat history too long').optional().default([]),
  documentContext: z.string().optional().default(''),
});

/**
 * Validate and sanitize a file from FormData.
 * @param {File} file - The uploaded file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const result = fileUploadSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const message = issues.length > 0 ? issues[0].message : 'Invalid file';
    return { valid: false, error: message };
  }

  return { valid: true };
}

/**
 * Sanitize user text input to prevent injection.
 * @param {string} text - Raw user input
 * @returns {string} Sanitized text
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .slice(0, 10000); // Hard limit on input length
}

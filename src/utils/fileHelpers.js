/**
 * File Helper Utilities
 * 
 * Functions for reading and converting uploaded files.
 */

import mammoth from 'mammoth';

/**
 * Extract text content from a file based on its MIME type.
 * For PDFs, we pass the raw buffer to Gemini (which reads PDFs natively).
 * For DOCX/TXT, we extract text first.
 * 
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{ text: string|null, buffer: Buffer, mimeType: string }>}
 */
export async function extractFileContent(buffer, mimeType) {
  switch (mimeType) {
    case 'application/pdf':
      // PDFs are sent directly to Gemini — it handles them natively
      return { text: null, buffer, mimeType };

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      // Extract text from DOCX using mammoth
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value, buffer, mimeType };
    }

    case 'text/plain': {
      // Direct text extraction
      const text = buffer.toString('utf-8');
      return { text, buffer, mimeType };
    }

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Get a human-readable file size string.
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.4 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename.
 * @param {string} filename
 * @returns {string} Extension including dot (e.g., ".pdf")
 */
export function getFileExtension(filename) {
  return '.' + filename.split('.').pop().toLowerCase();
}

/**
 * Determine MIME type from file extension (client-side fallback).
 * @param {string} filename
 * @returns {string} MIME type
 */
export function getMimeFromExtension(filename) {
  const ext = getFileExtension(filename);
  const mimeMap = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

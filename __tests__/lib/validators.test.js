/**
 * Tests for validator schemas
 */

import {
  validateFile,
  sanitizeInput,
  analyzeRequestSchema,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from '@/lib/validators';

describe('validateFile', () => {
  test('accepts valid PDF file', () => {
    const file = { name: 'contract.pdf', size: 1024, type: 'application/pdf' };
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  test('accepts valid DOCX file', () => {
    const file = {
      name: 'agreement.docx',
      size: 2048,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  test('accepts valid TXT file', () => {
    const file = { name: 'terms.txt', size: 512, type: 'text/plain' };
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  test('rejects invalid file type', () => {
    const file = { name: 'image.png', size: 1024, type: 'image/png' };
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('rejects file exceeding size limit', () => {
    const file = {
      name: 'huge.pdf',
      size: MAX_FILE_SIZE + 1,
      type: 'application/pdf',
    };
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('size');
  });

  test('rejects null file', () => {
    const result = validateFile(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('No file provided');
  });

  test('rejects undefined file', () => {
    const result = validateFile(undefined);
    expect(result.valid).toBe(false);
  });
});

describe('sanitizeInput', () => {
  test('removes HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  test('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  test('handles non-string input', () => {
    expect(sanitizeInput(123)).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('truncates very long input', () => {
    const longInput = 'A'.repeat(20000);
    const result = sanitizeInput(longInput);
    expect(result.length).toBeLessThanOrEqual(10000);
  });
});

describe('analyzeRequestSchema', () => {
  test('validates all supported analysis types', () => {
    const types = ['simplify', 'risk', 'checklist', 'lawyer-prep', 'suggest-questions', 'negotiate'];
    types.forEach(type => {
      const parsed = analyzeRequestSchema.safeParse({ analysisType: type });
      expect(parsed.success).toBe(true);
    });
  });

  test('rejects invalid analysis types', () => {
    const parsed = analyzeRequestSchema.safeParse({ analysisType: 'hack' });
    expect(parsed.success).toBe(false);
  });
});


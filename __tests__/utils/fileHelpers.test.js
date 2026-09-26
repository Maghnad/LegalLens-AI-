/**
 * Tests for file helper utilities
 */

import { formatFileSize, getFileExtension, getMimeFromExtension } from '@/utils/fileHelpers';

describe('formatFileSize', () => {
  test('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  test('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2560)).toBe('2.5 KB');
  });

  test('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });
});

describe('getFileExtension', () => {
  test('extracts pdf extension', () => {
    expect(getFileExtension('contract.pdf')).toBe('.pdf');
  });

  test('extracts docx extension', () => {
    expect(getFileExtension('agreement.docx')).toBe('.docx');
  });

  test('extracts txt extension', () => {
    expect(getFileExtension('terms.txt')).toBe('.txt');
  });

  test('handles multiple dots', () => {
    expect(getFileExtension('my.contract.v2.pdf')).toBe('.pdf');
  });
});

describe('getMimeFromExtension', () => {
  test('returns correct MIME for PDF', () => {
    expect(getMimeFromExtension('file.pdf')).toBe('application/pdf');
  });

  test('returns correct MIME for TXT', () => {
    expect(getMimeFromExtension('file.txt')).toBe('text/plain');
  });

  test('returns correct MIME for DOCX', () => {
    expect(getMimeFromExtension('file.docx')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  });

  test('returns octet-stream for unknown extension', () => {
    expect(getMimeFromExtension('file.xyz')).toBe('application/octet-stream');
  });
});

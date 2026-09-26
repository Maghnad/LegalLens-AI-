/**
 * Tests for utility formatters
 */

import {
  getRiskDisplay,
  getPriorityDisplay,
  getDiffSignificance,
  truncateText,
  getCategoryIcon,
  formatCategory,
  safeParseJSON,
} from '@/utils/formatters';

describe('getRiskDisplay', () => {
  test('returns correct display for low risk', () => {
    const result = getRiskDisplay('low');
    expect(result.label).toBe('Low Risk');
    expect(result.icon).toBe('✓');
  });

  test('returns correct display for high risk', () => {
    const result = getRiskDisplay('high');
    expect(result.label).toBe('High Risk');
    expect(result.icon).toBe('✗');
  });

  test('returns correct display for critical risk', () => {
    const result = getRiskDisplay('critical');
    expect(result.label).toBe('Critical');
    expect(result.icon).toBe('⛔');
  });

  test('returns medium for unknown risk level', () => {
    const result = getRiskDisplay('unknown');
    expect(result.label).toBe('Medium Risk');
  });
});

describe('getPriorityDisplay', () => {
  test('returns correct display for high priority', () => {
    const result = getPriorityDisplay('high');
    expect(result.label).toBe('High Priority');
  });

  test('returns medium for unknown priority', () => {
    const result = getPriorityDisplay('unknown');
    expect(result.label).toBe('Medium Priority');
  });
});

describe('getDiffSignificance', () => {
  test('returns correct colors for high significance', () => {
    const result = getDiffSignificance('high');
    expect(result.color).toBe('var(--color-danger)');
  });

  test('returns medium for unknown significance', () => {
    const result = getDiffSignificance('unknown');
    expect(result.color).toBe('var(--color-warning)');
  });
});

describe('truncateText', () => {
  test('returns original text if shorter than max', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  test('truncates text with ellipsis', () => {
    const longText = 'A'.repeat(300);
    const result = truncateText(longText, 200);
    expect(result.length).toBeLessThanOrEqual(204); // 200 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  test('handles null/undefined', () => {
    expect(truncateText(null)).toBe(null);
    expect(truncateText(undefined)).toBe(undefined);
  });
});

describe('getCategoryIcon', () => {
  test('returns correct icon for Addition', () => {
    expect(getCategoryIcon('Addition')).toBe('➕');
  });

  test('returns correct icon for Removal', () => {
    expect(getCategoryIcon('Removal')).toBe('➖');
  });

  test('returns default icon for unknown category', () => {
    expect(getCategoryIcon('Unknown')).toBe('📄');
  });
});

describe('formatCategory', () => {
  test('capitalizes first letter', () => {
    expect(formatCategory('addition')).toBe('Addition');
  });

  test('handles empty string', () => {
    expect(formatCategory('')).toBe('');
  });

  test('handles null/undefined', () => {
    expect(formatCategory(null)).toBe('');
    expect(formatCategory(undefined)).toBe('');
  });
});

describe('safeParseJSON', () => {
  test('parses valid JSON', () => {
    const result = safeParseJSON('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  test('strips markdown code blocks', () => {
    const result = safeParseJSON('```json\n{"key": "value"}\n```');
    expect(result).toEqual({ key: 'value' });
  });

  test('returns null for invalid JSON', () => {
    expect(safeParseJSON('not json')).toBeNull();
  });

  test('handles empty string', () => {
    expect(safeParseJSON('')).toBeNull();
  });
});

import {
  escapeIcsText,
  formatDateToIcs,
  formatDateToIcsDay,
  parseDateString,
  generateIcsContent,
} from '@/utils/calendarExport';

describe('Calendar Export Utilities', () => {
  describe('escapeIcsText', () => {
    it('escapes special characters correctly', () => {
      expect(escapeIcsText('Hello, World; Test\nNew line')).toBe('Hello\\, World\\; Test\\nNew line');
      expect(escapeIcsText(null)).toBe('');
      expect(escapeIcsText('')).toBe('');
    });
  });

  describe('formatDateToIcs and formatDateToIcsDay', () => {
    it('formats date to standard UTC format', () => {
      const date = new Date(Date.UTC(2026, 9, 15, 12, 30, 0));
      expect(formatDateToIcs(date)).toBe('20261015T123000Z');
      expect(formatDateToIcsDay(date)).toBe('20261015');
    });
  });

  describe('parseDateString', () => {
    it('parses standard ISO and string dates', () => {
      const date = parseDateString('2026-12-31');
      expect(date.getUTCFullYear()).toBe(2026);
    });

    it('parses relative day offsets', () => {
      const date = parseDateString('Within 30 days of notice');
      const now = new Date();
      expect(date.getTime()).toBeGreaterThan(now.getTime());
    });

    it('handles empty or invalid dates with fallback', () => {
      const date = parseDateString('Unspecified date');
      expect(date instanceof Date).toBe(true);
      expect(!isNaN(date.getTime())).toBe(true);
    });
  });

  describe('generateIcsContent', () => {
    it('generates valid RFC 5545 VCALENDAR string', () => {
      const events = [
        {
          date: '2026-11-01',
          event: 'Renewal Notice Deadline',
          action: 'Send 30-day written cancellation notice',
          details: 'Clause 4.2',
        },
      ];

      const ics = generateIcsContent(events, 'Commercial Lease');
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('SUMMARY:[LegalLens] Renewal Notice Deadline');
      expect(ics).toContain('Commercial Lease');
      expect(ics).toContain('BEGIN:VALARM');
      expect(ics).toContain('END:VCALENDAR');
    });
  });
});

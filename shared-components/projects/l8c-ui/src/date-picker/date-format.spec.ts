import {
  MONTHS,
  MONTHS_LONG,
  PICKER_LANGS,
  WEEKDAYS,
  formatDate,
  parseIsoDate,
  pickerLang,
  toIsoDate,
} from './date-format';

describe('date-format', () => {
  describe('pickerLang', () => {
    it('knows German and falls back to English for everything else', () => {
      expect(pickerLang('de')).toBe('de');
      expect(pickerLang('en')).toBe('en');
      expect(pickerLang('fr')).toBe('en');
      expect(pickerLang(null)).toBe('en');
      expect(pickerLang(undefined)).toBe('en');
    });

    it('has month and weekday names for every supported language', () => {
      for (const lang of PICKER_LANGS) {
        expect(MONTHS[lang].length).toBe(12);
        expect(MONTHS_LONG[lang].length).toBe(12);
        expect(WEEKDAYS[lang].length).toBe(7);
      }
      expect(WEEKDAYS.en[0]).toBe('Mo');
      expect(WEEKDAYS.de[0]).toBe('Mo');
    });
  });

  describe('formatDate', () => {
    it('renders the platform notation per language', () => {
      expect(formatDate('2026-03-07')).toBe('07 Mar 2026');
      expect(formatDate('2026-03-07', 'en')).toBe('07 Mar 2026');
      expect(formatDate('2026-10-07', 'de')).toBe('07 Okt 2026');
      expect(formatDate('2026-12-24', 'fr')).toBe('24 Dec 2026');
    });

    it('accepts Date objects and the date part of a date-time', () => {
      expect(formatDate(new Date(2026, 0, 5), 'de')).toBe('05 Jan 2026');
      expect(formatDate('2026-03-07T10:00:00Z')).toBe('07 Mar 2026');
    });

    it('returns empty for empty input and leaves other text unchanged', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('next week')).toBe('next week');
      expect(formatDate('2026-02-30')).toBe('2026-02-30');
      expect(formatDate(new Date('nope'))).toBe('Invalid Date');
    });
  });

  describe('parseIsoDate', () => {
    it('parses ISO dates to local dates', () => {
      const date = parseIsoDate('2026-03-07');
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(2);
      expect(date?.getDate()).toBe(7);
      expect(date?.getHours()).toBe(0);
    });

    it('reads the date part of a date-time', () => {
      expect(toIsoDate(parseIsoDate('2026-03-07T23:59:00Z')!)).toBe('2026-03-07');
    });

    it('rejects other formats, impossible dates and empty input', () => {
      expect(parseIsoDate('07.03.2026')).toBeNull();
      expect(parseIsoDate('2026-3-7')).toBeNull();
      expect(parseIsoDate('2026-02-30')).toBeNull();
      expect(parseIsoDate('2026-13-01')).toBeNull();
      expect(parseIsoDate('')).toBeNull();
      expect(parseIsoDate(null)).toBeNull();
      expect(parseIsoDate(undefined)).toBeNull();
    });
  });

  describe('toIsoDate', () => {
    it('pads month and day', () => {
      expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
      expect(toIsoDate(new Date(2026, 11, 24))).toBe('2026-12-24');
    });

    it('round-trips with parseIsoDate', () => {
      for (const iso of ['2024-02-29', '2026-01-01', '2026-12-31']) {
        expect(toIsoDate(parseIsoDate(iso)!)).toBe(iso);
      }
    });
  });
});

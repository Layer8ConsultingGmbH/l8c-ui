/** Languages the pickers know month and weekday names for; anything else gets English */
export const PICKER_LANGS = ['en', 'de'] as const;
export type PickerLang = (typeof PICKER_LANGS)[number];

/** Month abbreviations per UI language, the platform's one date notation */
export const MONTHS: Record<PickerLang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
};

export const MONTHS_LONG: Record<PickerLang, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  de: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
};

/** Weekday abbreviations, Monday first */
export const WEEKDAYS: Record<PickerLang, string[]> = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
};

export function pickerLang(lang: string | null | undefined): PickerLang {
  return lang === 'de' ? 'de' : 'en';
}

const pad = (value: number) => String(value).padStart(2, '0');

/** A local date as ISO "YYYY-MM-DD" */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The local date of an ISO "YYYY-MM-DD" (a date-time's date part is read too), or null */
export function parseIsoDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  if (!match) {
    return null;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (isNaN(date.getTime()) || date.getMonth() !== Number(match[2]) - 1) {
    return null;
  }
  return date;
}

/**
 * The platform's one date notation: "07 Mar 2026" / "07 Mär 2026". Anything
 * that is not an ISO date is returned unchanged rather than hidden; empty
 * input yields an empty string.
 */
export function formatDate(value: string | Date | null | undefined, lang?: string | null): string {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : parseIsoDate(value);
  if (!date || isNaN(date.getTime())) {
    return String(value);
  }
  return `${pad(date.getDate())} ${MONTHS[pickerLang(lang)][date.getMonth()]} ${date.getFullYear()}`;
}

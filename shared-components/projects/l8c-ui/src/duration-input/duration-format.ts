/**
 * The one duration format the platform stores: "DD:HH:MM:SS", every
 * segment zero padded to two digits, days capped at a year. Days beyond 99
 * simply take a third digit ("365:23:59:59"); nothing reads these values
 * by position.
 *
 * Answers written before the days segment existed are plain "HH:MM:SS".
 * Those are still read: hours beyond 23 move into the days segment so old
 * values stay readable. Anything else is left to the caller rather than
 * silently turned into a duration.
 */

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Upper bound per segment, in "DD:HH:MM:SS" order: days stop at a year */
export const DURATION_SEGMENT_MAX = [365, 23, 59, 59] as const;

export const DURATION_SEGMENT_COUNT = DURATION_SEGMENT_MAX.length;

const LEGACY_SEGMENT_COUNT = 3;
const HOURS_PER_DAY = 24;

function isWithinBounds(parts: DurationParts): boolean {
  return [parts.days, parts.hours, parts.minutes, parts.seconds].every(
    (value, index) => value <= DURATION_SEGMENT_MAX[index],
  );
}

/**
 * Read a stored duration. Returns null for everything that is not a
 * duration, including values out of bounds such as "99:99:99".
 */
export function parseDuration(value: unknown): DurationParts | null {
  if (typeof value !== 'string') {
    return null;
  }
  const texts = value.trim().split(':');
  if (texts.length !== DURATION_SEGMENT_COUNT && texts.length !== LEGACY_SEGMENT_COUNT) {
    return null;
  }
  const numbers: number[] = [];
  for (const text of texts) {
    const trimmed = text.trim();
    if (!/^\d{1,3}$/.test(trimmed)) {
      return null;
    }
    numbers.push(Number(trimmed));
  }
  if (numbers.length === LEGACY_SEGMENT_COUNT) {
    // Legacy "HH:MM:SS": no days segment and hours were not capped at 23
    numbers.unshift(0);
    numbers[0] = Math.floor(numbers[1] / HOURS_PER_DAY);
    numbers[1] = numbers[1] % HOURS_PER_DAY;
  }
  const [days, hours, minutes, seconds] = numbers;
  const parts = { days, hours, minutes, seconds };
  return isWithinBounds(parts) ? parts : null;
}

/** Render parts as the canonical "DD:HH:MM:SS" */
export function formatDuration(parts: DurationParts): string {
  return [parts.days, parts.hours, parts.minutes, parts.seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

/**
 * Split a stored duration into the segment texts of the duration input.
 * Unparsable input yields empty segments; the caller decides what to do
 * with the original text.
 */
export function durationToSegments(value: unknown): string[] {
  const parts = parseDuration(value);
  return parts ? formatDuration(parts).split(':') : Array(DURATION_SEGMENT_COUNT).fill('');
}

/**
 * Build the stored duration from the segment texts. Segments left empty
 * count as zero as long as at least one of them was filled in, so one
 * hour is stored as "00:01:00:00". An untouched input stays empty and the
 * answer therefore still counts as missing.
 */
export function durationFromSegments(segments: readonly string[]): string {
  if (segments.every((segment) => segment === '')) {
    return '';
  }
  return segments.map((segment) => (segment === '' ? '00' : segment.padStart(2, '0'))).join(':');
}

/**
 * Shared engine of l8c-duration-input and l8c-time-picker: numeric segments
 * typed from the left that hand over to the next segment on their own. A
 * segment never takes a value above its maximum; whatever does not fit
 * moves on, so "1111" typed into the hours of a duration becomes 11 hours
 * and 11 minutes. A segment nobody filled in shows "--".
 */

/** Stands in for a segment nobody filled in; "00" would read as an entered zero */
export const EMPTY_SEGMENT = '--';

/** Digits a segment can hold, derived from its maximum */
export function segmentDigits(max: readonly number[]): number[] {
  return max.map((value) => String(value).length);
}

/** A finished segment reads as "06", never as a lone "6" */
export function padSegment(text: string): string {
  return text === '' ? text : text.padStart(2, '0');
}

/**
 * Fill the segments from `index` on with `digits`. Returns the new texts
 * (every segment but the one to focus padded) and the segment to focus.
 */
export function applySegmentDigits(
  current: readonly string[],
  max: readonly number[],
  index: number,
  digits: string,
): { texts: string[]; focusIndex: number } {
  const digitsOf = segmentDigits(max);
  const count = max.length;
  const texts = [...current];
  texts[index] = '';
  let cursor = index;
  let text = '';

  for (const digit of digits) {
    const candidate = text + digit;
    if (candidate.length > digitsOf[cursor] || Number(candidate) > max[cursor]) {
      cursor += 1;
      if (cursor >= count) {
        break;
      }
      text = digit;
    } else {
      text = candidate;
    }
    texts[cursor] = text;
  }

  // Move on as soon as the segment cannot take another digit
  const isFull =
    cursor >= count || text.length === digitsOf[cursor] || Number(text + '0') > max[cursor];
  const focusIndex = isFull ? Math.min(cursor + 1, count - 1) : cursor;

  // Every segment but the one being typed in is finished and gets padded;
  // a segment filled by an overflowing digit never sees the focus, so
  // waiting for its blur would leave a lone "6" standing
  return {
    texts: texts.map((value, position) => (position === focusIndex ? value : padSegment(value))),
    focusIndex,
  };
}

/**
 * Keyboard navigation between segments: ":" and the arrow keys jump,
 * Backspace in an empty segment goes back, anything that is not a digit
 * is swallowed. Returns the segment to focus, or null to leave the key
 * to the browser.
 */
export function segmentKeydown(event: KeyboardEvent, index: number): number | null {
  const element = event.target as HTMLInputElement;
  const atStart = element.selectionStart === 0 && element.selectionEnd === 0;
  const atEnd = element.selectionStart === element.value.length;

  if (event.key === ':') {
    event.preventDefault();
    return index + 1;
  }
  if (event.key === 'ArrowLeft' && atStart) {
    event.preventDefault();
    return index - 1;
  }
  if (event.key === 'ArrowRight' && atEnd) {
    event.preventDefault();
    return index + 1;
  }
  if (event.key === 'Backspace' && element.value === '') {
    event.preventDefault();
    return index - 1;
  }
  // Everything that is not a digit would only be stripped again
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !/\d/.test(event.key)) {
    event.preventDefault();
  }
  return null;
}

/** The digits of a paste, or an empty string when there are none */
export function pastedDigits(event: ClipboardEvent): string {
  event.preventDefault();
  return event.clipboardData?.getData('text').replace(/\D/g, '') ?? '';
}

/** Puts the caret at the end of a segment */
export function focusSegment(element: HTMLInputElement | undefined): void {
  if (!element) {
    return;
  }
  element.focus();
  element.setSelectionRange(element.value.length, element.value.length);
}

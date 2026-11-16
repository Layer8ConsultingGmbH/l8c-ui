import {
  EMPTY_SEGMENT,
  applySegmentDigits,
  focusSegment,
  padSegment,
  pastedDigits,
  segmentDigits,
  segmentKeydown,
} from './segments';

const DURATION_MAX = [365, 23, 59, 59] as const;
const TIME_MAX = [23, 59] as const;

describe('segments', () => {
  it('exposes the empty placeholder and derives digits from the maximum', () => {
    expect(EMPTY_SEGMENT).toBe('--');
    expect(segmentDigits(DURATION_MAX)).toEqual([3, 2, 2, 2]);
    expect(segmentDigits(TIME_MAX)).toEqual([2, 2]);
  });

  it('pads a finished segment but leaves an empty one alone', () => {
    expect(padSegment('6')).toBe('06');
    expect(padSegment('12')).toBe('12');
    expect(padSegment('')).toBe('');
  });

  describe('applySegmentDigits', () => {
    it('fills a segment and stays while it can take more digits', () => {
      const result = applySegmentDigits(['', '', '', ''], DURATION_MAX, 0, '1');
      expect(result.texts).toEqual(['1', '', '', '']);
      expect(result.focusIndex).toBe(0);
    });

    it('moves on once a segment is full and pads it', () => {
      const result = applySegmentDigits(['', ''], TIME_MAX, 0, '12');
      expect(result.texts).toEqual(['12', '']);
      expect(result.focusIndex).toBe(1);
    });

    it('moves on with a digit that cannot start a valid value', () => {
      // 7 can never become 70 minutes, so it is handed over right away
      const result = applySegmentDigits(['', ''], TIME_MAX, 0, '7');
      expect(result.texts).toEqual(['07', '']);
      expect(result.focusIndex).toBe(1);
    });

    it('overflows into the next segments and pads the ones it filled', () => {
      // "1111" typed into the hours: 11 hours, 11 minutes, and the minutes are full
      const result = applySegmentDigits(['', '', '', ''], DURATION_MAX, 1, '1111');
      expect(result.texts).toEqual(['', '11', '11', '']);
      expect(result.focusIndex).toBe(3);
    });

    it('never takes a value above the maximum', () => {
      const result = applySegmentDigits(['', ''], TIME_MAX, 0, '25');
      expect(result.texts).toEqual(['02', '5']);
      expect(result.focusIndex).toBe(1);
    });

    it('drops digits that do not fit into the last segment', () => {
      const result = applySegmentDigits(['', ''], TIME_MAX, 1, '123');
      expect(result.texts).toEqual(['', '12']);
      expect(result.focusIndex).toBe(1);
    });

    it('clears a segment when no digits are left', () => {
      const result = applySegmentDigits(['12', '30'], TIME_MAX, 1, '');
      expect(result.texts).toEqual(['12', '']);
      expect(result.focusIndex).toBe(1);
    });
  });

  describe('segmentKeydown', () => {
    function keydown(key: string, value: string, caret: number, extra: KeyboardEventInit = {}) {
      const element = document.createElement('input');
      element.value = value;
      document.body.appendChild(element);
      element.setSelectionRange(caret, caret);
      const event = new KeyboardEvent('keydown', { key, cancelable: true, ...extra });
      let target: number | null = null;
      element.addEventListener('keydown', (e) => {
        target = segmentKeydown(e, 1);
      });
      element.dispatchEvent(event);
      element.remove();
      return { target, prevented: event.defaultPrevented };
    }

    it('jumps to the next segment on ":"', () => {
      expect(keydown(':', '1', 1)).toEqual({ target: 2, prevented: true });
    });

    it('moves with the arrows only at the edges of the text', () => {
      expect(keydown('ArrowLeft', '12', 0)).toEqual({ target: 0, prevented: true });
      expect(keydown('ArrowLeft', '12', 1)).toEqual({ target: null, prevented: false });
      expect(keydown('ArrowRight', '12', 2)).toEqual({ target: 2, prevented: true });
      expect(keydown('ArrowRight', '12', 1)).toEqual({ target: null, prevented: false });
    });

    it('goes back on Backspace in an empty segment only', () => {
      expect(keydown('Backspace', '', 0)).toEqual({ target: 0, prevented: true });
      expect(keydown('Backspace', '1', 1)).toEqual({ target: null, prevented: false });
    });

    it('swallows non-digit characters but leaves digits and shortcuts alone', () => {
      expect(keydown('a', '', 0)).toEqual({ target: null, prevented: true });
      expect(keydown('5', '', 0)).toEqual({ target: null, prevented: false });
      expect(keydown('v', '', 0, { ctrlKey: true })).toEqual({ target: null, prevented: false });
      expect(keydown('Tab', '', 0)).toEqual({ target: null, prevented: false });
    });
  });

  it('reads only the digits of a paste and blocks the default paste', () => {
    const event = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => '1h 30m' },
    });
    expect(pastedDigits(event)).toBe('130');
    expect(event.defaultPrevented).toBe(true);

    const empty = new Event('paste', { cancelable: true }) as ClipboardEvent;
    expect(pastedDigits(empty)).toBe('');
  });

  it('focuses a segment with the caret at its end and tolerates a missing one', () => {
    const element = document.createElement('input');
    element.value = '12';
    document.body.appendChild(element);

    focusSegment(element);
    expect(document.activeElement).toBe(element);
    expect(element.selectionStart).toBe(2);
    element.remove();

    expect(() => focusSegment(undefined)).not.toThrow();
  });
});

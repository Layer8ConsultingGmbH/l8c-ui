import {
  arrayInput,
  booleanInput,
  cssLengthInput,
  isoDateInput,
  numberInput,
  oneOf,
  optionalNumberInput,
  optionalOneOf,
  optionalStringInput,
  stringInput,
  warnInvalidInput,
} from './input-validation';

describe('input validation transforms', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  describe('warnInvalidInput', () => {
    it('names component, input, reason and value', () => {
      warnInvalidInput('l8c-icon', 'size', 'big', 'expected a number');
      expect(warn).toHaveBeenCalledWith(
        '[@l8c/ui] <l8c-icon> input "size": expected a number; got "big"',
      );
    });

    it('does not throw on values that cannot be serialised', () => {
      const circular: Record<string, unknown> = {};
      circular['self'] = circular;
      expect(() => warnInvalidInput('l8c-x', 'y', circular, 'nope')).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('numberInput', () => {
    const transform = numberInput('l8c-x', 'size', 24, { min: 1, max: 100, integer: true });

    it('passes valid numbers through', () => {
      expect(transform(12)).toBe(12);
      expect(warn).not.toHaveBeenCalled();
    });

    it('parses numeric strings', () => {
      expect(transform('16')).toBe(16);
      expect(transform(' 8 ')).toBe(8);
      expect(warn).not.toHaveBeenCalled();
    });

    it('uses the fallback for null and undefined without a warning', () => {
      expect(transform(null)).toBe(24);
      expect(transform(undefined)).toBe(24);
      expect(warn).not.toHaveBeenCalled();
    });

    it('uses the fallback and warns for text, empty strings, NaN and Infinity', () => {
      expect(transform('big')).toBe(24);
      expect(transform('')).toBe(24);
      expect(transform(Number.NaN)).toBe(24);
      expect(transform(Number.POSITIVE_INFINITY)).toBe(24);
      expect(warn).toHaveBeenCalledTimes(4);
    });

    it('clamps to min and max and warns', () => {
      expect(transform(0)).toBe(1);
      expect(transform(-5)).toBe(1);
      expect(transform(500)).toBe(100);
      expect(warn).toHaveBeenCalledTimes(3);
    });

    it('rounds to an integer without a warning', () => {
      expect(transform(2.4)).toBe(2);
      expect(transform(2.6)).toBe(3);
      expect(warn).not.toHaveBeenCalled();
    });

    it('keeps decimals when integer is not requested', () => {
      expect(numberInput('l8c-x', 'step', 1)(0.25)).toBe(0.25);
    });
  });

  describe('optionalNumberInput', () => {
    const transform = optionalNumberInput('l8c-x', 'max', { min: 0 });

    it('yields undefined for null, undefined and the empty string', () => {
      expect(transform(null)).toBeUndefined();
      expect(transform(undefined)).toBeUndefined();
      expect(transform('')).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    });

    it('parses numbers and numeric strings', () => {
      expect(transform(3)).toBe(3);
      expect(transform('7.5')).toBe(7.5);
    });

    it('ignores text with a warning and clamps to the range', () => {
      expect(transform('lots')).toBeUndefined();
      expect(transform(-1)).toBe(0);
      expect(warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('booleanInput', () => {
    const transform = booleanInput('l8c-x', 'disabled');

    it('passes booleans through', () => {
      expect(transform(true)).toBe(true);
      expect(transform(false)).toBe(false);
    });

    it('reads the bare attribute and the strings true/false', () => {
      expect(transform('')).toBe(true);
      expect(transform('true')).toBe(true);
      expect(transform('false')).toBe(false);
      expect(warn).not.toHaveBeenCalled();
    });

    it('uses the fallback for null and undefined without a warning', () => {
      expect(transform(null)).toBe(false);
      expect(booleanInput('l8c-x', 'hoverable', true)(undefined)).toBe(true);
      expect(warn).not.toHaveBeenCalled();
    });

    it('uses the fallback and warns for other text', () => {
      expect(transform('yes')).toBe(false);
      expect(booleanInput('l8c-x', 'hoverable', true)('no')).toBe(true);
      expect(warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('stringInput and optionalStringInput', () => {
    it('passes strings through and stringifies numbers', () => {
      expect(stringInput('l8c-x', 'label', 'x')('Hello')).toBe('Hello');
      expect(stringInput('l8c-x', 'label', 'x')(42)).toBe('42');
      expect(optionalStringInput('l8c-x', 'label')(42)).toBe('42');
      expect(warn).not.toHaveBeenCalled();
    });

    it('falls back for null and undefined without a warning', () => {
      expect(stringInput('l8c-x', 'label', 'x')(null)).toBe('x');
      expect(stringInput('l8c-x', 'label', 'x')(undefined)).toBe('x');
      expect(optionalStringInput('l8c-x', 'label')(null)).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    });

    it('falls back and warns for objects and NaN', () => {
      expect(stringInput('l8c-x', 'label', 'x')({} as unknown as string)).toBe('x');
      expect(stringInput('l8c-x', 'label', 'x')(Number.NaN)).toBe('x');
      expect(optionalStringInput('l8c-x', 'label')({} as unknown as string)).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(3);
    });
  });

  describe('oneOf and optionalOneOf', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    it('passes allowed values through', () => {
      expect(oneOf('l8c-x', 'size', sizes, 'medium')('large')).toBe('large');
      expect(optionalOneOf('l8c-x', 'size', sizes)('small')).toBe('small');
      expect(warn).not.toHaveBeenCalled();
    });

    it('uses the fallback for null and undefined without a warning', () => {
      expect(oneOf('l8c-x', 'size', sizes, 'medium')(null)).toBe('medium');
      expect(oneOf('l8c-x', 'size', sizes, 'medium')(undefined)).toBe('medium');
      expect(optionalOneOf('l8c-x', 'size', sizes)(undefined)).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    });

    it('uses the fallback and lists the allowed values for unknown ones', () => {
      expect(oneOf('l8c-x', 'size', sizes, 'medium')('huge' as unknown as 'small')).toBe('medium');
      expect(optionalOneOf('l8c-x', 'size', sizes)('huge' as unknown as 'small')).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(2);
      expect(warn.mock.calls[0][0]).toContain('"small", "medium", "large"');
    });
  });

  describe('arrayInput', () => {
    const transform = arrayInput<string>('l8c-x', 'options');

    it('passes arrays through and reads null and undefined as []', () => {
      expect(transform(['a', 'b'])).toEqual(['a', 'b']);
      expect(transform(null)).toEqual([]);
      expect(transform(undefined)).toEqual([]);
      expect(warn).not.toHaveBeenCalled();
    });

    it('reads non-arrays as [] with a warning', () => {
      expect(transform('a,b' as unknown as string[])).toEqual([]);
      expect(transform({} as unknown as string[])).toEqual([]);
      expect(warn).toHaveBeenCalledTimes(2);
    });

    it('drops null and undefined entries with a warning', () => {
      expect(transform(['a', null, undefined, 'b'] as unknown as string[])).toEqual(['a', 'b']);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('cssLengthInput', () => {
    const transform = cssLengthInput('l8c-x', 'width', 240);

    it('keeps px numbers and CSS lengths', () => {
      expect(transform(300)).toBe(300);
      expect(transform(0)).toBe(0);
      expect(transform('100%')).toBe('100%');
      expect(transform(' 20rem ')).toBe('20rem');
      expect(transform('calc(100vw - 2rem)')).toBe('calc(100vw - 2rem)');
      expect(transform('var(--dialog-width)')).toBe('var(--dialog-width)');
      expect(transform('auto')).toBe('auto');
      expect(warn).not.toHaveBeenCalled();
    });

    it('reads empty values as the fallback without a warning', () => {
      expect(transform('')).toBe(240);
      expect(transform(null)).toBe(240);
      expect(transform(undefined)).toBe(240);
      expect(cssLengthInput('l8c-x', 'width', undefined)(null)).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    });

    it('rejects negative numbers, unitless strings and text', () => {
      expect(transform(-10)).toBe(240);
      expect(transform(Number.NaN)).toBe(240);
      expect(transform('300')).toBe(240);
      expect(transform('wide')).toBe(240);
      expect(transform('100px; color: red')).toBe(240);
      expect(warn).toHaveBeenCalledTimes(5);
    });
  });

  describe('isoDateInput', () => {
    const transform = isoDateInput('l8c-x', 'min');

    it('keeps valid ISO dates', () => {
      expect(transform('2026-03-07')).toBe('2026-03-07');
      expect(transform('2024-02-29')).toBe('2024-02-29');
      expect(warn).not.toHaveBeenCalled();
    });

    it('converts a Date to its local calendar day', () => {
      expect(transform(new Date(2026, 10, 3))).toBe('2026-11-03');
    });

    it('reads empty values as undefined without a warning', () => {
      expect(transform('')).toBeUndefined();
      expect(transform(null)).toBeUndefined();
      expect(transform(undefined)).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    });

    it('ignores other formats, impossible dates and invalid Date objects', () => {
      expect(transform('07.03.2026')).toBeUndefined();
      expect(transform('2026-3-7')).toBeUndefined();
      expect(transform('2026-02-30')).toBeUndefined();
      expect(transform('2026-13-01')).toBeUndefined();
      expect(transform(new Date('nope'))).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(5);
    });
  });
});

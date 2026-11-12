import { isDevMode } from '@angular/core';

/**
 * Input transforms shared by all components.
 *
 * Every transform coerces what a template or an attribute may hand in
 * (numbers as strings, `''` for boolean attributes) and falls back to a
 * safe value for anything else. An invalid value is reported once per
 * assignment with `console.warn` in dev mode so the mistake is visible
 * while developing, but never throws: the component keeps rendering with
 * its default instead of taking the host app down.
 *
 * Usage:
 *
 * ```ts
 * size = input<number, NumberInput>(24, {
 *   transform: numberInput('l8c-icon', 'size', 24, { min: 1, integer: true }),
 * });
 * ```
 */

/** What a template may hand to a numeric input */
export type NumberInput = number | string | null | undefined;
/** What a template may hand to a boolean input (`''` for a bare attribute) */
export type BooleanInput = boolean | string | null | undefined;
/** What a template may hand to a string input */
export type StringInput = string | number | null | undefined;
/** What a template may hand to a width or other CSS length input */
export type CssLengthInput = number | string | null | undefined;

export interface NumberInputOptions {
  /** Smallest allowed value; smaller values are clamped to it */
  min?: number;
  /** Largest allowed value; larger values are clamped to it */
  max?: number;
  /** Round to an integer */
  integer?: boolean;
}

/** Logs a rejected input value in dev mode. Never throws. */
export function warnInvalidInput(
  component: string,
  name: string,
  value: unknown,
  reason: string,
): void {
  if (!isDevMode()) {
    return;
  }
  let shown: string;
  try {
    shown = JSON.stringify(value) ?? String(value);
  } catch {
    shown = String(value);
  }
  console.warn(`[@l8c/ui] <${component}> input "${name}": ${reason}; got ${shown}`);
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function applyRange(value: number, options: NumberInputOptions): number {
  let result = options.integer ? Math.round(value) : value;
  if (options.min !== undefined && result < options.min) {
    result = options.min;
  }
  if (options.max !== undefined && result > options.max) {
    result = options.max;
  }
  return result;
}

/**
 * Number input: accepts numbers and numeric strings, clamps to `min`/`max`,
 * falls back to `fallback` for anything that is not a finite number.
 */
export function numberInput(
  component: string,
  name: string,
  fallback: number,
  options: NumberInputOptions = {},
): (value: NumberInput) => number {
  return (value) => {
    if (value === null || value === undefined) {
      return fallback;
    }
    const parsed = toNumber(value);
    if (parsed === undefined) {
      warnInvalidInput(component, name, value, `expected a number, using ${fallback}`);
      return fallback;
    }
    const result = applyRange(parsed, options);
    if (result !== parsed && !(options.integer && Math.round(parsed) === result)) {
      warnInvalidInput(component, name, value, `out of range, using ${result}`);
    }
    return result;
  };
}

/** Like `numberInput`, but `null`, `undefined` and invalid values yield `undefined`. */
export function optionalNumberInput(
  component: string,
  name: string,
  options: NumberInputOptions = {},
): (value: NumberInput) => number | undefined {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = toNumber(value);
    if (parsed === undefined) {
      warnInvalidInput(component, name, value, 'expected a number, ignoring it');
      return undefined;
    }
    const result = applyRange(parsed, options);
    if (result !== parsed && !(options.integer && Math.round(parsed) === result)) {
      warnInvalidInput(component, name, value, `out of range, using ${result}`);
    }
    return result;
  };
}

/**
 * Boolean input: `true`/`false`, the bare attribute (`''`) and the strings
 * `'true'`/`'false'`. Anything else is reported and read as `fallback`.
 */
export function booleanInput(
  component: string,
  name: string,
  fallback = false,
): (value: BooleanInput) => boolean {
  return (value) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === null || value === undefined) {
      return fallback;
    }
    if (value === '' || value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    warnInvalidInput(component, name, value, `expected a boolean, using ${fallback}`);
    return fallback;
  };
}

/** String input: numbers are stringified, `null`/`undefined` become `fallback`. */
export function stringInput(
  component: string,
  name: string,
  fallback: string,
): (value: StringInput) => string {
  return (value) => {
    if (typeof value === 'string') {
      return value;
    }
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    warnInvalidInput(component, name, value, `expected a string, using "${fallback}"`);
    return fallback;
  };
}

/** Like `stringInput`, but `null`, `undefined`, and invalid values yield `undefined`. */
export function optionalStringInput(
  component: string,
  name: string,
): (value: StringInput) => string | undefined {
  return (value) => {
    if (typeof value === 'string') {
      return value;
    }
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    warnInvalidInput(component, name, value, 'expected a string, ignoring it');
    return undefined;
  };
}

/**
 * Input limited to a set of literal values (`'small' | 'medium' | 'large'`).
 * Unknown values are reported and read as `fallback`.
 */
export function oneOf<T extends string>(
  component: string,
  name: string,
  allowed: readonly T[],
  fallback: T,
): (value: T | null | undefined) => T {
  return (value) => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (allowed.includes(value as T)) {
      return value as T;
    }
    warnInvalidInput(
      component,
      name,
      value,
      `expected one of ${allowed.map((v) => `"${v}"`).join(', ')}, using "${fallback}"`,
    );
    return fallback;
  };
}

/** Like `oneOf`, but `null`, `undefined` and unknown values yield `undefined`. */
export function optionalOneOf<T extends string>(
  component: string,
  name: string,
  allowed: readonly T[],
): (value: T | null | undefined) => T | undefined {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (allowed.includes(value as T)) {
      return value as T;
    }
    warnInvalidInput(
      component,
      name,
      value,
      `expected one of ${allowed.map((v) => `"${v}"`).join(', ')}, ignoring it`,
    );
    return undefined;
  };
}

/**
 * Array input: anything that is not an array is reported and read as `[]`;
 * `null` and `undefined` entries are dropped.
 */
export function arrayInput<T>(
  component: string,
  name: string,
): (value: readonly T[] | null | undefined) => T[] {
  return (value) => {
    if (value === null || value === undefined) {
      return [];
    }
    if (!Array.isArray(value)) {
      warnInvalidInput(component, name, value, 'expected an array, using []');
      return [];
    }
    const items = (value as T[]).filter((item) => item !== null && item !== undefined);
    if (items.length !== value.length) {
      warnInvalidInput(component, name, value, 'dropped empty entries');
    }
    return items;
  };
}

const CSS_LENGTH =
  /^(auto|inherit|initial|unset|min-content|max-content|fit-content|0|[+]?(\d+\.?\d*|\.\d+)(px|em|rem|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)|(calc|min|max|clamp|var)\(.+\))$/i;

/**
 * Width or other CSS length: a positive px number or a CSS length string
 * (`'100%'`, `'20rem'`, `'calc(â€¦)'`, `'var(â€¦)'`). Negative numbers, plain
 * numeric strings without a unit and other text are reported and read as
 * `fallback`. `''`, `null` and `undefined` read as `fallback` without a warning.
 */
export function cssLengthInput<F extends number | string | undefined>(
  component: string,
  name: string,
  fallback: F,
): (value: CssLengthInput) => number | string | F {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    if (typeof value === 'number') {
      if (Number.isFinite(value) && value >= 0) {
        return value;
      }
      warnInvalidInput(component, name, value, 'expected a px number >= 0, using the default');
      return fallback;
    }
    const text = value.trim();
    if (CSS_LENGTH.test(text)) {
      return text;
    }
    warnInvalidInput(component, name, value, 'expected a CSS length, using the default');
    return fallback;
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * ISO date input (`YYYY-MM-DD`). Anything else is reported and read as
 * `undefined`. A `Date` is converted to its local calendar day.
 */
export function isoDateInput(
  component: string,
  name: string,
): (value: string | Date | null | undefined) => string | undefined {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        warnInvalidInput(component, name, value, 'invalid Date, ignoring it');
        return undefined;
      }
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${value.getFullYear()}-${month}-${day}`;
    }
    if (typeof value === 'string' && ISO_DATE.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      const probe = new Date(year, month - 1, day);
      if (
        probe.getFullYear() === year &&
        probe.getMonth() === month - 1 &&
        probe.getDate() === day
      ) {
        return value;
      }
    }
    warnInvalidInput(component, name, value, 'expected an ISO date (YYYY-MM-DD), ignoring it');
    return undefined;
  };
}

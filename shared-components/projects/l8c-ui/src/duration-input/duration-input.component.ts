import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  linkedSignal,
  output,
  viewChildren,
} from '@angular/core';
import {
  BooleanInput,
  StringInput,
  arrayInput,
  booleanInput,
  optionalStringInput,
  stringInput,
  warnInvalidInput,
} from '../shared/input-validation';
import {
  DURATION_SEGMENT_MAX,
  durationFromSegments,
  durationToSegments,
  parseDuration,
} from './duration-format';
import {
  EMPTY_SEGMENT,
  applySegmentDigits,
  focusSegment,
  padSegment,
  pastedDigits,
  segmentDigits,
  segmentKeydown,
} from './segments';

const SELECTOR = 'l8c-duration-input';
const UNITS = ['D', 'H', 'M', 'S'] as const;
const DIGITS = segmentDigits(DURATION_SEGMENT_MAX);
const DEFAULT_SEGMENT_LABELS: readonly string[] = ['Days', 'Hours', 'Minutes', 'Seconds'];
const DEFAULT_LEGACY_HINT = 'Stored value: {{value}}';

/** Exactly four segment names; missing or non-string entries take the default */
function segmentLabelsInput(value: readonly string[] | null | undefined): readonly string[] {
  const given = arrayInput<unknown>(SELECTOR, 'segmentLabels')(value);
  const labels = DEFAULT_SEGMENT_LABELS.map((fallback, index) => {
    const label = given[index];
    return typeof label === 'string' ? label : fallback;
  });
  if (Array.isArray(value) && given.length !== UNITS.length) {
    warnInvalidInput(
      SELECTOR,
      'segmentLabels',
      value,
      `expected ${UNITS.length} labels, missing ones use the defaults`,
    );
  } else if (given.some((label) => typeof label !== 'string')) {
    warnInvalidInput(SELECTOR, 'segmentLabels', value, 'expected strings, using the defaults');
  }
  return labels;
}

/**
 * Duration entry as four segments, each labelled with its unit: days,
 * hours, minutes, seconds. A segment nobody filled in shows "--", so it
 * stays visible what is still missing.
 *
 * Typing fills the segments from the left and moves on by itself: a full
 * segment hands over, and so does a digit that cannot start a valid value
 * (a 7 in the minutes, which could never become 70). A segment never takes
 * a value above its maximum, so minutes and seconds stop at 59, hours at
 * 23 and days at 365.
 *
 * The value is emitted in the stored format "DD:HH:MM:SS" with empty
 * segments counted as zero, and stays empty while no segment is filled.
 * Read only (a results view) the same value is rendered as plain text.
 * All texts are finished strings - pass translated values from the host.
 */
@Component({
  selector: 'l8c-duration-input',
  templateUrl: './duration-input.component.html',
  styleUrls: ['./duration-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cDurationInputComponent {
  /** Stored value in "DD:HH:MM:SS"; legacy "HH:MM:SS" is read as well */
  value = input<string, StringInput>('', { transform: stringInput(SELECTOR, 'value', '') });
  ariaLabel = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(SELECTOR, 'ariaLabel'),
  });
  /** Show the saved value with its units instead of editable segments */
  readOnly = input<boolean, BooleanInput>(false, {
    transform: booleanInput(SELECTOR, 'readOnly'),
  });
  disabled = input<boolean, BooleanInput>(false, {
    transform: booleanInput(SELECTOR, 'disabled'),
  });
  error = input<boolean, BooleanInput>(false, { transform: booleanInput(SELECTOR, 'error') });
  /**
   * Accessible names of the four segments: days, hours, minutes, seconds.
   * Missing or non-string entries fall back to the English defaults.
   */
  segmentLabels = input<readonly string[], readonly string[] | null | undefined>(
    DEFAULT_SEGMENT_LABELS,
    { transform: segmentLabelsInput },
  );
  /**
   * Text below the field for a stored value that is no duration;
   * `{{value}}` is replaced with that value. Empty: no hint.
   */
  legacyHint = input<string, StringInput>(DEFAULT_LEGACY_HINT, {
    transform: stringInput(SELECTOR, 'legacyHint', DEFAULT_LEGACY_HINT),
  });
  /** Canonical value after every edit, empty while no segment is filled */
  valueChange = output<string>();

  protected readonly segments = UNITS.map((unit, index) => ({ unit, digits: DIGITS[index] }));
  protected readonly emptySegment = EMPTY_SEGMENT;

  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('segmentInput');

  /** Segment texts follow the bound value, until the user edits them */
  protected segmentTexts = linkedSignal<string[]>(() => durationToSegments(this.value()));

  /**
   * Stored text that is not a duration. The field may have accepted free
   * text once, so old values can hold anything; the value is shown next to
   * the empty input instead of being dropped without a trace.
   */
  protected legacyText = computed(() => {
    const text = this.value().trim();
    const hint = this.legacyHint();
    return text && hint && !parseDuration(text) ? hint.replace(/\{\{\s*value\s*\}\}/g, text) : '';
  });

  protected onInput(index: number, event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.applyDigits(index, digits);
  }

  protected onPaste(index: number, event: ClipboardEvent): void {
    const digits = pastedDigits(event);
    if (digits) {
      this.applyDigits(index, digits);
    }
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    const target = segmentKeydown(event, index);
    if (target !== null) {
      focusSegment(this.inputs()[target]?.nativeElement);
    }
  }

  /** A single digit left in a segment is padded once it loses the focus */
  protected onBlur(index: number): void {
    const texts = this.segmentTexts();
    if (texts[index].length !== 1) {
      return;
    }
    const next = [...texts];
    next[index] = padSegment(next[index]);
    this.segmentTexts.set(next);
    this.writeToDom();
    this.valueChange.emit(durationFromSegments(next));
  }

  private applyDigits(index: number, digits: string): void {
    const { texts, focusIndex } = applySegmentDigits(
      this.segmentTexts(),
      DURATION_SEGMENT_MAX,
      index,
      digits,
    );
    this.segmentTexts.set(texts);
    this.valueChange.emit(durationFromSegments(texts));
    this.writeToDom();
    focusSegment(this.inputs()[focusIndex]?.nativeElement);
  }

  /**
   * Rejected keystrokes leave the field with text the value binding does
   * not know about, so the segments are written back by hand.
   */
  private writeToDom(): void {
    const texts = this.segmentTexts();
    this.inputs().forEach((ref, index) => {
      if (ref.nativeElement.value !== texts[index]) {
        ref.nativeElement.value = texts[index];
      }
    });
  }
}

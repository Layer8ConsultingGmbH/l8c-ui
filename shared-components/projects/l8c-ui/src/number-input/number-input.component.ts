import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { L8cIconComponent } from '../icon/icon.component';
import {
  NumberInput,
  numberInput,
  optionalNumberInput,
  optionalStringInput,
  StringInput,
} from '../shared/input-validation';

/**
 * Number field with a custom stepper (the native spinner is hidden),
 * optional suffix next to the field (e.g. "%") and an optional hint line.
 *
 * The field only takes digits, one leading minus (when `min` allows a
 * negative value) and, with `decimals` above 0, one decimal separator
 * (`.` or `,`). Other keys and pasted characters are dropped, so the typed
 * text is always a number or empty. The arrow keys step like the arrows.
 */
@Component({
  selector: 'l8c-number-input',
  imports: [L8cIconComponent],
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => L8cNumberInputComponent),
      multi: true,
    },
  ],
})
export class L8cNumberInputComponent implements ControlValueAccessor {
  /** Increment applied by the stepper arrows */
  step = input<number, NumberInput>(1, {
    transform: numberInput('l8c-number-input', 'step', 1, { min: 0 }),
  });
  /** Fraction digits used to format the value for display */
  decimals = input<number, NumberInput>(0, {
    transform: numberInput('l8c-number-input', 'decimals', 0, { min: 0, max: 20, integer: true }),
  });
  min = input<number | undefined, NumberInput>(undefined, {
    transform: optionalNumberInput('l8c-number-input', 'min'),
  });
  max = input<number | undefined, NumberInput>(undefined, {
    transform: optionalNumberInput('l8c-number-input', 'max'),
  });
  /** Static text rendered next to the field (e.g. "%") */
  suffix = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-number-input', 'suffix'),
  });
  /** Hint line rendered below the field */
  hint = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-number-input', 'hint'),
  });
  ariaLabel = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-number-input', 'ariaLabel'),
  });

  /** The stepper increment; a step of 0 would freeze the arrows, so it reads as 1 */
  private effectiveStep = computed(() => (this.step() > 0 ? this.step() : 1));
  /** A minus is only useful when a negative value is allowed */
  private allowsNegative = computed(() => {
    const min = this.min();
    return min === undefined || min < 0;
  });
  // Writable input: also set internally by setDisabledState
  disabled = model<boolean>(false);
  valueChange = output<number>();

  value = signal<number>(0);
  isFocused = signal<boolean>(false);
  // Raw text while the user is typing, so reformatting does not fight the caret
  private editingText = signal<string | null>(null);

  displayValue = computed(() => {
    const editing = this.editingText();
    return editing !== null ? editing : this.value().toFixed(this.decimals());
  });

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.editingText.set(null);
    this.value.set(typeof value === 'number' && !isNaN(value) ? value : 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /**
   * Lets through control keys and shortcuts, digits, one leading minus and
   * one decimal separator; swallows everything else. ArrowUp/ArrowDown step.
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (event.key === 'ArrowUp') {
        this.increment();
      } else {
        this.decrement();
      }
      return;
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const field = event.target as HTMLInputElement;
    const next = this.replaceSelection(field, event.key);
    if (!this.isAllowedText(next)) {
      event.preventDefault();
    }
  }

  /** Inserts only the usable characters of the clipboard text */
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const field = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const next = this.sanitize(this.replaceSelection(field, pasted));
    if (next === field.value) {
      return;
    }
    field.value = next;
    this.applyText(next);
  }

  onInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    // Keydown and paste already filter; this catches IME, drag and drop and
    // browser autofill, which bypass both
    const text = this.sanitize(field.value);
    if (text !== field.value) {
      field.value = text;
    }
    this.applyText(text);
  }

  increment(): void {
    this.editingText.set(null);
    this.commit(this.value() + this.effectiveStep());
  }

  decrement(): void {
    this.editingText.set(null);
    this.commit(this.value() - this.effectiveStep());
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.editingText.set(null);
    this.onTouched();
  }

  private applyText(text: string): void {
    this.editingText.set(text);
    const num = parseFloat(text.replace(',', '.'));
    this.commit(isNaN(num) ? 0 : num);
  }

  /** The field text after typing or pasting `insert` over the current selection */
  private replaceSelection(field: HTMLInputElement, insert: string): string {
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? field.value.length;
    return field.value.slice(0, start) + insert + field.value.slice(end);
  }

  /** Digits, an optional leading minus and at most one separator; may be unfinished ("-", "3.") */
  private isAllowedText(text: string): boolean {
    const pattern = this.decimals() > 0 ? /^-?\d*(?:[.,]\d*)?$/ : /^-?\d*$/;
    return pattern.test(text) && (this.allowsNegative() || !text.startsWith('-'));
  }

  /** Drops every character that `isAllowedText` would not let through */
  private sanitize(text: string): string {
    let result = '';
    for (const char of text) {
      if (this.isAllowedText(result + char)) {
        result += char;
      }
    }
    return result;
  }

  private commit(value: number): void {
    const min = this.min();
    const max = this.max();
    let next = value;
    if (min !== undefined && next < min) {
      next = min;
    }
    if (max !== undefined && next > max) {
      next = max;
    }
    this.value.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
  }
}

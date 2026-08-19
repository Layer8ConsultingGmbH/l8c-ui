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

/**
 * Number field with a custom stepper (the native spinner is hidden),
 * optional suffix next to the field (e.g. "%") and an optional hint line.
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
  step = input<number>(1);
  /** Fraction digits used to format the value for display */
  decimals = input<number>(0);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  /** Static text rendered next to the field (e.g. "%") */
  suffix = input<string | undefined>(undefined);
  /** Hint line rendered below the field */
  hint = input<string | undefined>(undefined);
  ariaLabel = input<string | undefined>(undefined);
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

  // Free decimal typing when the display format allows fraction digits
  inputStep = computed(() => (this.decimals() > 0 ? 'any' : String(this.step())));

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

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.editingText.set(text);
    const num = parseFloat(text);
    this.commit(isNaN(num) ? 0 : num);
  }

  increment(): void {
    this.editingText.set(null);
    this.commit(this.value() + this.step());
  }

  decrement(): void {
    this.editingText.set(null);
    this.commit(this.value() - this.step());
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.editingText.set(null);
    this.onTouched();
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

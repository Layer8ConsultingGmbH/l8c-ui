import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { L8cIconComponent } from '../icon/icon.component';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'l8c-select',
  imports: [L8cIconComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => L8cSelectComponent),
      multi: true,
    },
  ],
})
export class L8cSelectComponent implements ControlValueAccessor {
  label = input<string | undefined>(undefined);
  placeholder = input<string | undefined>('');
  options = input<SelectOption[]>([]);
  // Writable input: also set internally by setDisabledState
  disabled = model<boolean>(false);
  required = input<boolean>(false);
  error = input<string | undefined>(undefined);
  ariaLabel = input<string | undefined>(undefined);
  valueChange = output<string>();

  value = signal<string>('');
  isFocused = signal<boolean>(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onChange_internal(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value.set(target.value);
    this.onChange(this.value());
    this.valueChange.emit(this.value());

    // Reset to placeholder after selection if placeholder exists (useful for multi-select scenarios)
    if (this.placeholder() && this.value()) {
      setTimeout(() => {
        this.value.set('');
        this.onChange('');
      }, 0);
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }
}

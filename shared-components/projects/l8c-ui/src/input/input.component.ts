import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'l8c-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => L8cInputComponent),
      multi: true,
    },
  ],
})
export class L8cInputComponent implements ControlValueAccessor {
  label = input<string | undefined>(undefined);
  placeholder = input<string | undefined>('');
  type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date'>('text');
  // Writable input: also set internally by setDisabledState
  disabled = model<boolean>(false);
  required = input<boolean>(false);
  error = input<string | undefined>(undefined);
  ariaLabel = input<string | undefined>(undefined);
  maxLength = input<number | undefined>(undefined);
  minLength = input<number | undefined>(undefined);
  /** Lower bound for date/number inputs (native min attribute) */
  min = input<string | undefined>(undefined);
  /** Upper bound for date/number inputs (native max attribute) */
  max = input<string | undefined>(undefined);
  multiline = input<boolean>(false);
  rows = input<number>(1);
  valueChange = output<string>();

  value = signal<string>('');
  isFocused = signal<boolean>(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private elementRef = inject(ElementRef);

  constructor() {
    // Grow the textarea whenever the value changes, including programmatic
    // writes (e.g. a form being populated from the backend) - not just typing
    afterRenderEffect(() => {
      this.value();
      if (this.multiline()) {
        const textarea = this.elementRef.nativeElement.querySelector(
          'textarea',
        ) as HTMLTextAreaElement | null;
        if (textarea) {
          this.adjustTextareaHeight(textarea);
        }
      }
    });
  }

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

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(this.value());
    this.valueChange.emit(this.value());

    if (this.multiline() && target instanceof HTMLTextAreaElement) {
      this.adjustTextareaHeight(target);
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  private adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

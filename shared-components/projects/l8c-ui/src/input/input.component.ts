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
import {
  BooleanInput,
  booleanInput,
  NumberInput,
  numberInput,
  oneOf,
  optionalNumberInput,
  optionalStringInput,
  stringInput,
  StringInput,
} from '../shared/input-validation';

const INPUT_TYPES = ['text', 'email', 'password', 'number', 'tel', 'url', 'date'] as const;
type InputType = (typeof INPUT_TYPES)[number];

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
  label = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-input', 'label'),
  });
  placeholder = input<string | undefined, StringInput>('', {
    transform: stringInput('l8c-input', 'placeholder', ''),
  });
  type = input<InputType, InputType | null | undefined>('text', {
    transform: oneOf('l8c-input', 'type', INPUT_TYPES, 'text'),
  });
  // Writable input: also set internally by setDisabledState
  disabled = model<boolean>(false);
  required = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-input', 'required'),
  });
  error = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-input', 'error'),
  });
  ariaLabel = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-input', 'ariaLabel'),
  });
  maxLength = input<number | undefined, NumberInput>(undefined, {
    transform: optionalNumberInput('l8c-input', 'maxLength', { min: 0, integer: true }),
  });
  minLength = input<number | undefined, NumberInput>(undefined, {
    transform: optionalNumberInput('l8c-input', 'minLength', { min: 0, integer: true }),
  });
  /** Lower bound for date/number inputs (native min attribute) */
  min = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-input', 'min'),
  });
  /** Upper bound for date/number inputs (native max attribute) */
  max = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-input', 'max'),
  });
  multiline = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-input', 'multiline'),
  });
  rows = input<number, NumberInput>(1, {
    transform: numberInput('l8c-input', 'rows', 1, { min: 1, integer: true }),
  });
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

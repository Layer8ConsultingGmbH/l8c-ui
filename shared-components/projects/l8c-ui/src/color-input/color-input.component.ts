import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const HEX6 = /^#[0-9a-f]{6}$/i;
const HEX3 = /^#[0-9a-f]{3}$/i;

/** The value the native picker understands (#rrggbb), or null */
function toPicker(value: string): string | null {
  const text = value.trim();
  if (HEX6.test(text)) {
    return text.toLowerCase();
  }
  if (HEX3.test(text)) {
    return (
      '#' +
      text
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
        .toLowerCase()
    );
  }
  return null;
}

/** Whether the browser accepts the value as a color */
function isColor(value: string): boolean {
  const text = value.trim();
  if (!text) {
    return false;
  }
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    return CSS.supports('color', text);
  }
  return HEX6.test(text) || HEX3.test(text);
}

/**
 * Color field: a swatch that opens the system color picker plus a text
 * field for any CSS color (hex, rgb(), rgba(), hsl(), ...). Replaces bare
 * `type="color"` + text pairs.
 *
 * The swatch shows the current color on a checkerboard, so transparency
 * stays visible; the picker only edits #rrggbb and writes that back. An
 * invalid value shows a hatched swatch and, with `invalidMessage`, an error
 * line. Emits the text as typed.
 */
@Component({
  selector: 'l8c-color-input',
  templateUrl: './color-input.component.html',
  styleUrls: ['./color-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => L8cColorInputComponent),
      multi: true,
    },
  ],
})
export class L8cColorInputComponent implements ControlValueAccessor {
  label = input<string | undefined>(undefined);
  /** Accessible name when there is no visible label */
  ariaLabel = input<string | undefined>(undefined);
  required = input<boolean>(false);
  hint = input<string | undefined>(undefined);
  error = input<string | undefined>(undefined);
  /** Shown while the value is not a color the browser understands */
  invalidMessage = input<string | undefined>(undefined);
  // Writable input: also set internally by setDisabledState
  disabled = model<boolean>(false);
  placeholder = input<string>('#rrggbb');
  /** Field width; default 200px */
  width = input<number | string>(200);
  valueChange = output<string>();

  value = signal<string>('');
  isFocused = signal<boolean>(false);

  protected readonly valid = computed(() => isColor(this.value()));
  protected readonly pickerValue = computed(() => toPicker(this.value()) ?? '#000000');
  protected readonly shownError = computed(() => {
    const error = this.error();
    if (error) {
      return error;
    }
    return this.value() && !this.valid() ? this.invalidMessage() : undefined;
  });
  protected readonly name = computed(() => this.ariaLabel() ?? this.label());
  protected readonly swatchLabel = computed(() => {
    const name = this.name();
    return name ? `${name}: ${this.value() || this.placeholder()}` : undefined;
  });
  protected readonly cssWidth = computed(() => {
    const width = this.width();
    return typeof width === 'number' ? `${width}px` : width;
  });

  private readonly picker = viewChild<ElementRef<HTMLInputElement>>('picker');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
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

  protected openPicker(): void {
    if (!this.disabled()) {
      this.picker()?.nativeElement.click();
    }
  }

  protected onInput(event: Event): void {
    this.update((event.target as HTMLInputElement).value);
  }

  protected onPicked(event: Event): void {
    this.update((event.target as HTMLInputElement).value);
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  private update(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }
}

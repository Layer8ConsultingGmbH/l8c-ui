import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { L8cIconComponent } from '../icon/icon.component';
import {
  BooleanInput,
  NumberInput,
  StringInput,
  booleanInput,
  numberInput,
  optionalStringInput,
  stringInput,
} from '../shared/input-validation';
import {
  EMPTY_SEGMENT,
  applySegmentDigits,
  focusSegment,
  padSegment,
  pastedDigits,
  segmentKeydown,
} from '../duration-input/segments';

const SELECTOR = 'l8c-time-picker';
const MAX = [23, 59] as const;

/** "HH:MM" into its two segment texts; anything else is empty */
function toSegments(value: string): string[] {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (match && Number(match[1]) <= 23 && Number(match[2]) <= 59) {
    return [match[1].padStart(2, '0'), match[2]];
  }
  return ['', ''];
}

/** "HH:MM" from the segment texts, "" while both are empty */
function fromSegments(segments: readonly string[]): string {
  if (segments.every((segment) => segment === '')) {
    return '';
  }
  return segments.map((segment) => (segment === '' ? '00' : segment.padStart(2, '0'))).join(':');
}

/**
 * 24-hour time entry "HH:MM": two typed segments that hand over like the
 * duration input (hours stop at 23, minutes at 59; empty shows "--") plus a
 * clock button that opens a list of times every `step` minutes. Emits
 * "HH:MM", or "" while both segments are empty. Works with `[(value)]` and
 * as a form control. All texts are finished strings.
 */
@Component({
  selector: 'l8c-time-picker',
  imports: [L8cIconComponent],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => L8cTimePickerComponent),
      multi: true,
    },
  ],
})
export class L8cTimePickerComponent implements ControlValueAccessor {
  /** "HH:MM" or "" */
  value = model<string>('');
  label = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(SELECTOR, 'label'),
  });
  required = input<boolean, BooleanInput>(false, {
    transform: booleanInput(SELECTOR, 'required'),
  });
  hint = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(SELECTOR, 'hint'),
  });
  error = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(SELECTOR, 'error'),
  });
  // Writable input: also set internally by setDisabledState
  disabled = model<boolean>(false);
  /** Minutes between the times in the list, 1 to 1440; default 30 */
  step = input<number, NumberInput>(30, {
    transform: numberInput(SELECTOR, 'step', 30, { min: 1, max: 24 * 60, integer: true }),
  });
  hourLabel = input<string, StringInput>('Hours', {
    transform: stringInput(SELECTOR, 'hourLabel', 'Hours'),
  });
  minuteLabel = input<string, StringInput>('Minutes', {
    transform: stringInput(SELECTOR, 'minuteLabel', 'Minutes'),
  });
  /** Accessible name of the clock button and the list */
  listLabel = input<string, StringInput>('Choose time', {
    transform: stringInput(SELECTOR, 'listLabel', 'Choose time'),
  });

  protected readonly emptySegment = EMPTY_SEGMENT;
  protected readonly open = signal(false);
  protected readonly focused = signal(false);
  /** The value the segments last produced; their texts only follow other writes */
  private lastEmitted: string | null = null;
  /** Segment texts follow the bound value, until the user edits them */
  protected readonly segmentTexts = linkedSignal<string, string[]>({
    source: this.value,
    computation: (value, previous) =>
      previous && value === this.lastEmitted ? previous.value : toSegments(value),
  });
  protected readonly segments = [
    { index: 0, label: this.hourLabel },
    { index: 1, label: this.minuteLabel },
  ];
  protected readonly options = computed(() => {
    const step = Math.max(1, Math.floor(this.step()));
    const times: string[] = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += step) {
      times.push(
        `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
      );
    }
    return times;
  });

  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('segmentInput');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

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

  @HostListener('document:mousedown', ['$event'])
  protected onDocumentMousedown(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  // ---- segments ----

  protected onInput(index: number, event: Event): void {
    this.applyDigits(index, (event.target as HTMLInputElement).value.replace(/\D/g, ''));
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

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(index: number): void {
    this.focused.set(false);
    this.onTouched();
    const texts = this.segmentTexts();
    if (texts[index].length !== 1) {
      return;
    }
    const next = [...texts];
    next[index] = padSegment(next[index]);
    this.commit(next);
  }

  private applyDigits(index: number, digits: string): void {
    const { texts, focusIndex } = applySegmentDigits(this.segmentTexts(), MAX, index, digits);
    this.commit(texts);
    focusSegment(this.inputs()[focusIndex]?.nativeElement);
  }

  private commit(texts: string[]): void {
    this.segmentTexts.set(texts);
    this.writeToDom();
    this.update(fromSegments(texts));
  }

  private writeToDom(): void {
    const texts = this.segmentTexts();
    this.inputs().forEach((ref, index) => {
      if (ref.nativeElement.value !== texts[index]) {
        ref.nativeElement.value = texts[index];
      }
    });
  }

  // ---- list ----

  protected toggle(): void {
    if (this.open()) {
      this.close(true);
      return;
    }
    if (this.disabled()) {
      return;
    }
    this.open.set(true);
    afterNextRender(
      () => {
        const list = this.list()?.nativeElement;
        const current =
          list?.querySelector<HTMLElement>('[aria-selected="true"]') ??
          list?.querySelector<HTMLElement>('button');
        current?.focus();
      },
      { injector: this.injector },
    );
  }

  protected close(refocus: boolean): void {
    this.open.set(false);
    if (refocus) {
      this.trigger()?.nativeElement.focus();
    }
  }

  protected pick(time: string): void {
    this.segmentTexts.set(toSegments(time));
    this.writeToDom();
    this.update(time);
    this.close(true);
  }

  protected onListKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.close(true);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();
    const current = event.target as HTMLElement;
    const sibling =
      event.key === 'ArrowDown' ? current.nextElementSibling : current.previousElementSibling;
    (sibling as HTMLElement | null)?.focus();
  }

  private update(value: string): void {
    this.lastEmitted = value;
    this.value.set(value);
    this.onChange(value);
  }
}

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
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { L8cIconComponent } from '../icon/icon.component';
import { L8cFormatDatePipe } from './format-date.pipe';
import {
  MONTHS_LONG,
  PickerLang,
  WEEKDAYS,
  formatDate,
  parseIsoDate,
  pickerLang,
  toIsoDate,
} from './date-format';

let nextId = 0;

interface CalendarDay {
  date: Date;
  iso: string;
  label: number;
  inMonth: boolean;
  selected: boolean;
  today: boolean;
  cursor: boolean;
  disabled: boolean;
}

/**
 * Date field with a calendar popover; replaces the browser's native
 * `type="date"` so the field looks the same in every browser and theme.
 *
 * The value is ISO "YYYY-MM-DD" or ""; the field shows the platform
 * notation "07 Mar 2026" in `lang`. Weeks start on Monday. Keyboard: the
 * field is a button that opens the popover; in the grid the arrows move by
 * day and week, PageUp/PageDown by month, Home/End to the start and end of
 * the week, Enter picks, Escape closes and returns the focus to the field.
 * Works with `[(value)]` and as a form control.
 */
@Component({
  selector: 'l8c-date-picker',
  imports: [L8cIconComponent, L8cFormatDatePipe],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => L8cDatePickerComponent),
      multi: true,
    },
  ],
})
export class L8cDatePickerComponent implements ControlValueAccessor {
  /** ISO "YYYY-MM-DD" or "" */
  value = model<string>('');
  label = input<string | undefined>(undefined);
  placeholder = input<string>('Select date');
  required = input<boolean>(false);
  hint = input<string | undefined>(undefined);
  error = input<string | undefined>(undefined);
  // Writable input: also set internally by setDisabledState
  disabled = model<boolean>(false);
  /** Earliest selectable day, ISO */
  min = input<string | undefined>(undefined);
  /** Latest selectable day, ISO */
  max = input<string | undefined>(undefined);
  /** Language of month names and weekdays */
  lang = input<PickerLang | string>('en');
  todayLabel = input<string>('Today');
  clearLabel = input<string>('Clear');
  openLabel = input<string>('Open calendar');
  prevLabel = input<string>('Previous month');
  nextLabel = input<string>('Next month');
  /** Field width; default 260px */
  width = input<number | string>(260);

  protected readonly id = `l8c-date-picker-${nextId++}`;
  protected readonly open = signal(false);
  /** The day the keyboard is on while the popover is open */
  protected readonly cursor = signal<Date>(startOfDay(new Date()));

  protected readonly language = computed(() => pickerLang(this.lang()));
  protected readonly weekdays = computed(() => WEEKDAYS[this.language()]);
  protected readonly selectedDate = computed(() => parseIsoDate(this.value()));
  protected readonly displayValue = computed(() =>
    this.value() ? formatDate(this.value(), this.language()) : '',
  );
  protected readonly monthTitle = computed(
    () =>
      `${MONTHS_LONG[this.language()][this.cursor().getMonth()]} ${this.cursor().getFullYear()}`,
  );
  protected readonly cssWidth = computed(() => {
    const width = this.width();
    return typeof width === 'number' ? `${width}px` : width;
  });
  protected readonly todayDisabled = computed(() => this.isOutOfRange(startOfDay(new Date())));

  /** Six weeks around the cursor's month, Monday first */
  protected readonly days = computed<CalendarDay[]>(() => {
    const cursor = this.cursor();
    const selected = this.selectedDate();
    const today = startOfDay(new Date());
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        date,
        iso: toIsoDate(date),
        label: date.getDate(),
        inMonth: date.getMonth() === cursor.getMonth(),
        selected: sameDay(date, selected),
        today: sameDay(date, today),
        cursor: sameDay(date, cursor),
        disabled: this.isOutOfRange(date),
      };
    });
  });

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');
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
      this.onTouched();
    }
  }

  protected toggle(): void {
    if (this.open()) {
      this.close(true);
      return;
    }
    if (this.disabled()) {
      return;
    }
    this.cursor.set(this.selectedDate() ?? startOfDay(new Date()));
    this.open.set(true);
    this.focusCursor();
  }

  protected close(refocus: boolean): void {
    this.open.set(false);
    this.onTouched();
    if (refocus) {
      this.trigger()?.nativeElement.focus();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.close(true);
    }
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const cursor = this.cursor();
    const weekday = (cursor.getDay() + 6) % 7;
    switch (event.key) {
      case 'ArrowLeft':
        this.moveDays(-1);
        break;
      case 'ArrowRight':
        this.moveDays(1);
        break;
      case 'ArrowUp':
        this.moveDays(-7);
        break;
      case 'ArrowDown':
        this.moveDays(7);
        break;
      case 'PageUp':
        this.moveMonths(-1);
        break;
      case 'PageDown':
        this.moveMonths(1);
        break;
      case 'Home':
        this.moveDays(-weekday);
        break;
      case 'End':
        this.moveDays(6 - weekday);
        break;
      case 'Enter':
      case ' ':
        this.pick(cursor);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  protected moveMonths(months: number): void {
    const cursor = this.cursor();
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + months, 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(cursor.getDate(), lastDay));
    this.cursor.set(next);
    this.focusCursor();
  }

  private moveDays(days: number): void {
    const next = new Date(this.cursor());
    next.setDate(next.getDate() + days);
    this.cursor.set(next);
    this.focusCursor();
  }

  protected pick(date: Date): void {
    if (this.isOutOfRange(date)) {
      return;
    }
    this.update(toIsoDate(date));
    this.close(true);
  }

  protected pickToday(): void {
    this.pick(startOfDay(new Date()));
  }

  protected clear(): void {
    this.update('');
    this.close(true);
  }

  private update(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  private isOutOfRange(date: Date): boolean {
    const min = parseIsoDate(this.min());
    const max = parseIsoDate(this.max());
    return (min !== null && date < min) || (max !== null && date > max);
  }

  /** Moves the focus to the cursor's cell once it is rendered */
  private focusCursor(): void {
    afterNextRender(
      () => {
        const cell = this.grid()?.nativeElement.querySelector<HTMLElement>(
          `[data-date="${toIsoDate(this.cursor())}"]`,
        );
        cell?.focus();
      },
      { injector: this.injector },
    );
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date | null, b: Date | null): boolean {
  return a !== null && b !== null && toIsoDate(a) === toIsoDate(b);
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import {
  BooleanInput,
  CssLengthInput,
  StringInput,
  booleanInput,
  cssLengthInput,
  isoDateInput,
  optionalStringInput,
  stringInput,
  warnInvalidInput,
} from '../shared/input-validation';
import { showPanel } from '../picker/popover';
import { L8cFormatDatePipe } from './format-date.pipe';
import {
  MONTHS,
  MONTHS_LONG,
  PICKER_LANGS,
  PickerLang,
  WEEKDAYS,
  formatDate,
  parseIsoDate,
  pickerLang,
  toIsoDate,
} from './date-format';

const SELECTOR = 'l8c-date-picker';
/** Years shown at once in the year view */
const YEARS_PER_VIEW = 12;

let nextId = 0;

/** A supported picker language; a locale such as "de-DE" is read by its language, unknown ones warn and read as English */
function langInput(value: PickerLang | string | null | undefined): PickerLang {
  if (value === null || value === undefined || value === '') {
    return 'en';
  }
  if (typeof value !== 'string') {
    warnInvalidInput(SELECTOR, 'lang', value, 'expected a language code, using "en"');
    return 'en';
  }
  const language = value.trim().toLowerCase().split(/[-_]/)[0];
  if ((PICKER_LANGS as readonly string[]).includes(language)) {
    return language as PickerLang;
  }
  warnInvalidInput(
    SELECTOR,
    'lang',
    value,
    `expected one of ${PICKER_LANGS.map((l) => `"${l}"`).join(', ')}, using "en"`,
  );
  return 'en';
}

/** What the popover shows: the days of a month, the months of a year or a block of years */
export type DatePickerView = 'days' | 'months' | 'years';

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

interface CalendarMonth {
  index: number;
  label: string;
  selected: boolean;
  current: boolean;
  cursor: boolean;
  disabled: boolean;
}

interface CalendarYear {
  year: number;
  selected: boolean;
  current: boolean;
  cursor: boolean;
  disabled: boolean;
}

/**
 * Date field with a calendar popover; replaces the browser's native
 * `type="date"` so the field looks the same in every browser and theme.
 *
 * The value is ISO "YYYY-MM-DD" or ""; the field shows the platform
 * notation "07 Mar 2026" in `lang`. Weeks start on Monday.
 *
 * Views: the title of the day view opens the month view (12 months of the
 * year), the title of the month view opens the year view (12 years), so a
 * date years away is three clicks from the field. Prev/next step by month,
 * year or 12 years depending on the view.
 *
 * Keyboard: the field is a button that opens the popover; in the day grid
 * the arrows move by day and week, PageUp/PageDown by month and with Shift
 * by year, Home/End to the start and end of the week, Enter picks. In the
 * month and year grids the arrows move by one and by row, PageUp/PageDown
 * by year or block, Enter picks. Escape goes back one view or, in the day
 * view, closes and returns the focus to the field.
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
  label = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(SELECTOR, 'label'),
  });
  placeholder = input<string, StringInput>('Select date', {
    transform: stringInput(SELECTOR, 'placeholder', 'Select date'),
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
  /** Earliest selectable day, ISO (a Date is read as its local calendar day) */
  min = input<string | undefined, string | Date | null | undefined>(undefined, {
    transform: isoDateInput(SELECTOR, 'min'),
  });
  /** Latest selectable day, ISO (a Date is read as its local calendar day) */
  max = input<string | undefined, string | Date | null | undefined>(undefined, {
    transform: isoDateInput(SELECTOR, 'max'),
  });
  /** Language of month names and weekdays; unknown languages fall back to English */
  lang = input<PickerLang, PickerLang | string | null | undefined>('en', {
    transform: langInput,
  });
  todayLabel = input<string, StringInput>('Today', {
    transform: stringInput(SELECTOR, 'todayLabel', 'Today'),
  });
  clearLabel = input<string, StringInput>('Clear', {
    transform: stringInput(SELECTOR, 'clearLabel', 'Clear'),
  });
  openLabel = input<string, StringInput>('Open calendar', {
    transform: stringInput(SELECTOR, 'openLabel', 'Open calendar'),
  });
  prevLabel = input<string, StringInput>('Previous month', {
    transform: stringInput(SELECTOR, 'prevLabel', 'Previous month'),
  });
  nextLabel = input<string, StringInput>('Next month', {
    transform: stringInput(SELECTOR, 'nextLabel', 'Next month'),
  });
  /** Accessible name of the title in the day view, which opens the month view */
  chooseMonthLabel = input<string, StringInput>('Choose month', {
    transform: stringInput(SELECTOR, 'chooseMonthLabel', 'Choose month'),
  });
  /** Accessible name of the title in the month view, which opens the year view */
  chooseYearLabel = input<string, StringInput>('Choose year', {
    transform: stringInput(SELECTOR, 'chooseYearLabel', 'Choose year'),
  });
  prevYearLabel = input<string, StringInput>('Previous year', {
    transform: stringInput(SELECTOR, 'prevYearLabel', 'Previous year'),
  });
  nextYearLabel = input<string, StringInput>('Next year', {
    transform: stringInput(SELECTOR, 'nextYearLabel', 'Next year'),
  });
  prevYearsLabel = input<string, StringInput>('Previous years', {
    transform: stringInput(SELECTOR, 'prevYearsLabel', 'Previous years'),
  });
  nextYearsLabel = input<string, StringInput>('Next years', {
    transform: stringInput(SELECTOR, 'nextYearsLabel', 'Next years'),
  });
  /** Field width as px number or CSS length; default 260px */
  width = input<number | string, CssLengthInput>(260, {
    transform: cssLengthInput(SELECTOR, 'width', 260),
  });

  protected readonly id = `l8c-date-picker-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly view = signal<DatePickerView>('days');
  /** The day the keyboard is on while the popover is open */
  protected readonly cursor = signal<Date>(startOfDay(new Date()));

  protected readonly language = computed(() => pickerLang(this.lang()));
  protected readonly weekdays = computed(() => WEEKDAYS[this.language()]);
  protected readonly selectedDate = computed(() => parseIsoDate(this.value()));
  protected readonly displayValue = computed(() =>
    this.value() ? formatDate(this.value(), this.language()) : '',
  );
  protected readonly cssWidth = computed(() => {
    const width = this.width();
    return typeof width === 'number' ? `${width}px` : width;
  });
  protected readonly todayDisabled = computed(() => this.isOutOfRange(startOfDay(new Date())));

  /** First year of the 12-year block around the cursor */
  private readonly yearBlockStart = computed(
    () => Math.floor(this.cursor().getFullYear() / YEARS_PER_VIEW) * YEARS_PER_VIEW,
  );

  /** What the header shows: "March 2026", "2026" or "2024 – 2035" */
  protected readonly title = computed(() => {
    const cursor = this.cursor();
    switch (this.view()) {
      case 'days':
        return `${MONTHS_LONG[this.language()][cursor.getMonth()]} ${cursor.getFullYear()}`;
      case 'months':
        return String(cursor.getFullYear());
      case 'years': {
        const start = this.yearBlockStart();
        return `${start} – ${start + YEARS_PER_VIEW - 1}`;
      }
    }
  });
  /** Accessible name of the title button; the year view's title is plain text */
  protected readonly titleLabel = computed(() => {
    switch (this.view()) {
      case 'days':
        return this.chooseMonthLabel();
      case 'months':
        return this.chooseYearLabel();
      case 'years':
        return null;
    }
  });
  protected readonly prevStepLabel = computed(() => {
    switch (this.view()) {
      case 'days':
        return this.prevLabel();
      case 'months':
        return this.prevYearLabel();
      case 'years':
        return this.prevYearsLabel();
    }
  });
  protected readonly nextStepLabel = computed(() => {
    switch (this.view()) {
      case 'days':
        return this.nextLabel();
      case 'months':
        return this.nextYearLabel();
      case 'years':
        return this.nextYearsLabel();
    }
  });

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

  /** The twelve months of the cursor's year */
  protected readonly months = computed<CalendarMonth[]>(() => {
    const cursor = this.cursor();
    const year = cursor.getFullYear();
    const selected = this.selectedDate();
    const today = new Date();
    return MONTHS[this.language()].map((label, index) => ({
      index,
      label,
      selected: selected?.getFullYear() === year && selected.getMonth() === index,
      current: today.getFullYear() === year && today.getMonth() === index,
      cursor: cursor.getMonth() === index,
      disabled: this.isMonthOutOfRange(year, index),
    }));
  });

  /** The twelve years of the cursor's block */
  protected readonly years = computed<CalendarYear[]>(() => {
    const start = this.yearBlockStart();
    const cursorYear = this.cursor().getFullYear();
    const selectedYear = this.selectedDate()?.getFullYear();
    const currentYear = new Date().getFullYear();
    return Array.from({ length: YEARS_PER_VIEW }, (_, index) => {
      const year = start + index;
      return {
        year,
        selected: year === selectedYear,
        current: year === currentYear,
        cursor: year === cursorYear,
        disabled: this.isYearOutOfRange(year),
      };
    });
  });

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  /** Stops the open panel from following scroll and resize; set while it is open */
  private stopFollowing: (() => void) | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.hidePanel());
  }

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
      this.hidePanel();
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
    this.view.set('days');
    this.open.set(true);
    afterNextRender(
      () => {
        const trigger = this.trigger()?.nativeElement;
        const panel = this.panel()?.nativeElement;
        if (trigger && panel && this.open()) {
          this.stopFollowing = showPanel(trigger, panel);
        }
      },
      { injector: this.injector },
    );
    this.focusCursor();
  }

  protected close(refocus: boolean): void {
    this.hidePanel();
    this.onTouched();
    if (refocus) {
      this.trigger()?.nativeElement.focus();
    }
  }

  /** Closes the panel; removing it from the DOM also takes it out of the top layer */
  private hidePanel(): void {
    this.stopFollowing?.();
    this.stopFollowing = null;
    this.open.set(false);
  }

  /** Escape steps back one view, or closes from the day view */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    if (this.view() === 'days') {
      this.close(true);
    } else {
      this.showView(this.view() === 'years' ? 'months' : 'days');
    }
  }

  // ---- header ----

  /** The day view's title opens the month view, the month view's title the year view */
  protected onTitleClick(): void {
    if (this.view() === 'days') {
      this.showView('months');
    } else if (this.view() === 'months') {
      this.showView('years');
    }
  }

  protected stepPrev(): void {
    this.step(-1);
  }

  protected stepNext(): void {
    this.step(1);
  }

  /** One step of the header arrows: a month, a year or a block of years */
  private step(direction: 1 | -1): void {
    switch (this.view()) {
      case 'days':
        this.moveMonths(direction);
        break;
      case 'months':
        this.moveYears(direction);
        break;
      case 'years':
        this.moveYears(direction * YEARS_PER_VIEW);
        break;
    }
  }

  // ---- day view ----

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
        if (event.shiftKey) {
          this.moveYears(-1);
        } else {
          this.moveMonths(-1);
        }
        break;
      case 'PageDown':
        if (event.shiftKey) {
          this.moveYears(1);
        } else {
          this.moveMonths(1);
        }
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
    this.cursor.set(shiftMonths(this.cursor(), months));
    this.focusCursor();
  }

  protected moveYears(years: number): void {
    this.cursor.set(shiftMonths(this.cursor(), years * 12));
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

  // ---- month view ----

  protected onMonthsKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.moveMonths(-1);
        break;
      case 'ArrowRight':
        this.moveMonths(1);
        break;
      case 'ArrowUp':
        this.moveMonths(-3);
        break;
      case 'ArrowDown':
        this.moveMonths(3);
        break;
      case 'PageUp':
        this.moveYears(-1);
        break;
      case 'PageDown':
        this.moveYears(1);
        break;
      case 'Home':
        this.moveMonths(-this.cursor().getMonth());
        break;
      case 'End':
        this.moveMonths(11 - this.cursor().getMonth());
        break;
      case 'Enter':
      case ' ':
        this.pickMonth(this.cursor().getMonth());
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  /** Shows the days of a month of the cursor's year */
  protected pickMonth(month: number): void {
    const cursor = this.cursor();
    if (this.isMonthOutOfRange(cursor.getFullYear(), month)) {
      return;
    }
    this.cursor.set(shiftMonths(cursor, month - cursor.getMonth()));
    this.showView('days');
  }

  // ---- year view ----

  protected onYearsKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.moveYears(-1);
        break;
      case 'ArrowRight':
        this.moveYears(1);
        break;
      case 'ArrowUp':
        this.moveYears(-3);
        break;
      case 'ArrowDown':
        this.moveYears(3);
        break;
      case 'PageUp':
        this.moveYears(-YEARS_PER_VIEW);
        break;
      case 'PageDown':
        this.moveYears(YEARS_PER_VIEW);
        break;
      case 'Home':
        this.moveYears(this.yearBlockStart() - this.cursor().getFullYear());
        break;
      case 'End':
        this.moveYears(this.yearBlockStart() + YEARS_PER_VIEW - 1 - this.cursor().getFullYear());
        break;
      case 'Enter':
      case ' ':
        this.pickYear(this.cursor().getFullYear());
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  /** Shows the months of a year */
  protected pickYear(year: number): void {
    if (this.isYearOutOfRange(year)) {
      return;
    }
    this.cursor.set(shiftMonths(this.cursor(), (year - this.cursor().getFullYear()) * 12));
    this.showView('months');
  }

  // ---- shared ----

  private showView(view: DatePickerView): void {
    this.view.set(view);
    this.focusCursor();
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

  /** True when no day of the month is in range */
  private isMonthOutOfRange(year: number, month: number): boolean {
    const min = parseIsoDate(this.min());
    const max = parseIsoDate(this.max());
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    return (min !== null && last < min) || (max !== null && first > max);
  }

  /** True when no day of the year is in range */
  private isYearOutOfRange(year: number): boolean {
    const min = parseIsoDate(this.min());
    const max = parseIsoDate(this.max());
    return (min !== null && year < min.getFullYear()) || (max !== null && year > max.getFullYear());
  }

  /** Moves the focus to the cursor's cell of the current view once it is rendered */
  private focusCursor(): void {
    afterNextRender(
      () => {
        const panel = this.panel()?.nativeElement;
        if (!panel) {
          return;
        }
        const cursor = this.cursor();
        let selector: string;
        switch (this.view()) {
          case 'days':
            selector = `[data-date="${toIsoDate(cursor)}"]`;
            break;
          case 'months':
            selector = `[data-month="${cursor.getMonth()}"]`;
            break;
          case 'years':
            selector = `[data-year="${cursor.getFullYear()}"]`;
            break;
        }
        panel.querySelector<HTMLElement>(selector)?.focus();
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

/** The same day of the month `months` away, clamped to the target month's length */
function shiftMonths(date: Date, months: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(date.getDate(), lastDay));
  return next;
}

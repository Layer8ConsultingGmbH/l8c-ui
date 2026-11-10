import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { L8cDatePickerComponent } from './date-picker.component';
import { formatDate, parseIsoDate, toIsoDate } from './date-format';

@Component({
  imports: [L8cDatePickerComponent, ReactiveFormsModule],
  template: `
    <l8c-date-picker
      [label]="'Due date'"
      [lang]="lang()"
      [min]="min()"
      [max]="max()"
      [todayLabel]="'Heute'"
      [clearLabel]="'Leeren'"
      [width]="width()"
      [formControl]="control"
    />
  `,
})
class HostComponent {
  control = new FormControl('2026-03-07', { nonNullable: true });
  lang = signal('en');
  min = signal<string | Date | undefined>(undefined);
  max = signal<string | Date | undefined>(undefined);
  width = signal<number | string>(260);
}

describe('L8cDatePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const field = (): HTMLButtonElement => fixture.nativeElement.querySelector('.picker-field');
  const panel = (): HTMLElement | null => fixture.nativeElement.querySelector('.picker-panel');
  const day = (iso: string): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector(`[data-date="${iso}"]`);
  const keyOnGrid = (key: string) => {
    fixture.nativeElement
      .querySelector('.calendar-grid')
      .dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the value in the platform notation and is labelled', () => {
    expect(field().textContent?.trim()).toBe('07 Mar 2026');
    expect(fixture.nativeElement.querySelector('label').getAttribute('for')).toBe(field().id);

    host.control.setValue('2026-10-07');
    host.lang.set('de');
    fixture.detectChanges();
    expect(field().textContent?.trim()).toBe('07 Okt 2026');
  });

  it('lifts the calendar into the top layer and places it in viewport coordinates', async () => {
    const show = vi.fn();
    HTMLElement.prototype.showPopover = show;
    try {
      field().click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(panel()!.getAttribute('popover')).toBe('manual');
      expect(show).toHaveBeenCalledTimes(1);
      expect(panel()!.style.top).toMatch(/px$/);
      expect(panel()!.style.left).toMatch(/px$/);
      expect(panel()!.dataset['placement']).toBe('below');
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
    }
  });

  it('opens the calendar on the selected month with the selected day marked', () => {
    field().click();
    fixture.detectChanges();

    expect(panel()).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.month-title').textContent.trim()).toBe(
      'March 2026',
    );
    const selected = day('2026-03-07')!;
    expect(selected.classList.contains('selected')).toBe(true);
    expect(selected.getAttribute('aria-selected')).toBe('true');
    expect(selected.getAttribute('tabindex')).toBe('0');
    // Weeks start on Monday: the grid starts on 23 February
    expect(fixture.nativeElement.querySelector('.day').getAttribute('data-date')).toBe(
      '2026-02-23',
    );
  });

  it('picks a day by click and closes', () => {
    field().click();
    fixture.detectChanges();

    day('2026-03-12')!.click();
    fixture.detectChanges();

    expect(host.control.value).toBe('2026-03-12');
    expect(panel()).toBeNull();
    expect(field().textContent?.trim()).toBe('12 Mar 2026');
  });

  it('moves with the keyboard and picks with Enter', () => {
    field().click();
    fixture.detectChanges();

    keyOnGrid('ArrowDown');
    keyOnGrid('ArrowRight');
    expect(day('2026-03-15')!.getAttribute('tabindex')).toBe('0');

    keyOnGrid('PageDown');
    expect(fixture.nativeElement.querySelector('.month-title').textContent.trim()).toBe(
      'April 2026',
    );
    keyOnGrid('Enter');

    expect(host.control.value).toBe('2026-04-15');
    expect(panel()).toBeNull();
  });

  it('disables days outside min and max and the today shortcut outside the range', () => {
    host.min.set('2026-03-05');
    host.max.set('2026-03-20');
    fixture.detectChanges();
    expect(field().getAttribute('max')).toBe('2026-03-20');

    field().click();
    fixture.detectChanges();

    expect(day('2026-03-04')!.disabled).toBe(true);
    expect(day('2026-03-05')!.disabled).toBe(false);
    expect(day('2026-03-21')!.disabled).toBe(true);
    const today = fixture.nativeElement.querySelector('.calendar-footer button:last-child');
    expect(today.textContent.trim()).toBe('Heute');
    expect(today.disabled).toBe(true);

    day('2026-03-04')!.click();
    fixture.detectChanges();
    expect(host.control.value).toBe('2026-03-07');
  });

  it('clears the value from the footer', () => {
    field().click();
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector('.calendar-footer button:first-child');
    expect(clear.textContent.trim()).toBe('Leeren');
    clear.click();
    fixture.detectChanges();

    expect(host.control.value).toBe('');
    expect(field().textContent?.trim()).toBe('Select date');
  });

  it('closes on Escape and on a click outside', () => {
    field().click();
    fixture.detectChanges();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();

    field().click();
    fixture.detectChanges();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('follows the disabled state of the form control', () => {
    host.control.disable();
    fixture.detectChanges();

    expect(field().disabled).toBe(true);
    field().click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    const container = (): HTMLElement => fixture.nativeElement.querySelector('.picker-container');

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('falls back to English for an unknown language and reads a locale by its language', () => {
      host.lang.set('xx');
      fixture.detectChanges();
      expect(field().textContent?.trim()).toBe('07 Mar 2026');
      expect(warn).toHaveBeenCalledTimes(1);

      host.control.setValue('2026-10-07');
      host.lang.set('de-DE');
      fixture.detectChanges();
      expect(field().textContent?.trim()).toBe('07 Okt 2026');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('reads min as a Date and ignores a min that is no ISO date', () => {
      host.min.set(new Date(2026, 2, 10));
      fixture.detectChanges();
      field().click();
      fixture.detectChanges();
      expect(day('2026-03-09')?.disabled).toBe(true);
      expect(day('2026-03-10')?.disabled).toBe(false);
      expect(warn).not.toHaveBeenCalled();

      host.min.set('10.03.2026');
      fixture.detectChanges();
      expect(day('2026-03-09')?.disabled).toBe(false);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('keeps the default width for a width that is no CSS length', () => {
      host.width.set('100%');
      fixture.detectChanges();
      expect(container().style.width).toBe('100%');

      host.width.set('wide');
      fixture.detectChanges();
      expect(container().style.width).toBe('260px');
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('date helpers', () => {
  it('formats ISO dates and leaves other text alone', () => {
    expect(formatDate('2026-03-07')).toBe('07 Mar 2026');
    expect(formatDate('2026-10-07T10:00:00', 'de')).toBe('07 Okt 2026');
    expect(formatDate(new Date(2026, 11, 24), 'fr')).toBe('24 Dec 2026');
    expect(formatDate('next week')).toBe('next week');
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  it('parses only real dates', () => {
    expect(toIsoDate(parseIsoDate('2026-02-28')!)).toBe('2026-02-28');
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('07.03.2026')).toBeNull();
    expect(parseIsoDate('')).toBeNull();
  });
});

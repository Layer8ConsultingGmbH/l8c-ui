import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cDurationInputComponent } from './duration-input.component';

@Component({
  imports: [L8cDurationInputComponent],
  template: `<l8c-duration-input
    [value]="value()"
    [readOnly]="readOnly()"
    [segmentLabels]="['Tage', 'Stunden', 'Minuten', 'Sekunden']"
    [legacyHint]="'Wert: {{value}}'"
    (valueChange)="emitted.set($event)"
  />`,
})
class HostComponent {
  value = signal('');
  readOnly = signal(false);
  emitted = signal<string | null>(null);
}

describe('L8cDurationInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const segments = (): HTMLInputElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('input'));

  const texts = (): string[] => segments().map((input) => input.value);

  const units = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.unit')).map((unit) =>
      (unit as HTMLElement).textContent?.trim(),
    );

  /** Type digit by digit into whatever segment currently has the focus */
  function type(digits: string): void {
    for (const digit of digits) {
      const element = document.activeElement as HTMLInputElement;
      // The browser blocks a digit past the segment length through maxlength
      if (element.value.length >= element.maxLength) {
        return;
      }
      element.value = element.value + digit;
      element.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders four segments labelled with their units and the passed names', () => {
    expect(segments().map((input) => input.placeholder)).toEqual(['--', '--', '--', '--']);
    expect(segments().map((input) => input.getAttribute('aria-label'))).toEqual([
      'Tage',
      'Stunden',
      'Minuten',
      'Sekunden',
    ]);
    expect(texts()).toEqual(['', '', '', '']);
    expect(units()).toEqual(['D', 'H', 'M', 'S']);
  });

  it('moves on to the next segment once two digits are typed', () => {
    segments()[1].focus();
    type('1111');

    expect(texts()).toEqual(['', '11', '11', '']);
    expect(host.emitted()).toBe('00:11:11:00');
  });

  it('moves on right away when a digit cannot start a valid value', () => {
    segments()[2].focus();
    type('75');

    expect(texts()).toEqual(['', '', '07', '5']);
    expect(host.emitted()).toBe('00:00:07:05');
  });

  it('pads a lone digit on blur and fills untouched segments with zeros', () => {
    segments()[1].focus();
    type('1');
    segments()[1].blur();
    fixture.detectChanges();

    expect(texts()).toEqual(['', '01', '', '']);
    expect(host.emitted()).toBe('00:01:00:00');
  });

  it('takes three digits of days up to a year', () => {
    segments()[0].focus();
    type('365');

    expect(texts()).toEqual(['365', '', '', '']);
    expect(host.emitted()).toBe('365:00:00:00');
  });

  it('jumps between segments with ":" and the arrow keys', () => {
    segments()[0].focus();
    segments()[0].dispatchEvent(new KeyboardEvent('keydown', { key: ':', cancelable: true }));
    expect(document.activeElement).toBe(segments()[1]);

    segments()[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true }),
    );
    expect(document.activeElement).toBe(segments()[0]);
  });

  it('stays empty while nothing is entered', () => {
    segments()[3].focus();
    type('1');
    const element = segments()[3];
    element.value = '';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.emitted()).toBe('');
  });

  it('shows a stored value in its segments, including the legacy format', () => {
    host.value.set('01:02:03:04');
    fixture.detectChanges();
    expect(texts()).toEqual(['01', '02', '03', '04']);

    host.value.set('12:30:00');
    fixture.detectChanges();
    expect(texts()).toEqual(['00', '12', '30', '00']);
  });

  it('reads a saved value with its units when read only', () => {
    host.readOnly.set(true);
    host.value.set('99:23:59:59');
    fixture.detectChanges();

    const display = fixture.nativeElement.querySelector('.duration-input');
    expect(display.textContent.replace(/\s+/g, ' ').trim()).toBe('99D 23H 59M 59S');
    expect(segments()).toEqual([]);
  });

  it('marks the segments of a missing value when read only', () => {
    host.readOnly.set(true);
    fixture.detectChanges();

    const display = fixture.nativeElement.querySelector('.duration-input');
    expect(display.textContent.replace(/\s+/g, ' ').trim()).toBe('--D --H --M --S');
  });

  it('keeps a stored value that is not a duration visible', () => {
    host.value.set('99:99:99');
    fixture.detectChanges();

    expect(texts()).toEqual(['', '', '', '']);
    expect(fixture.nativeElement.querySelector('.legacy-hint').textContent.trim()).toBe(
      'Wert: 99:99:99',
    );
  });
});

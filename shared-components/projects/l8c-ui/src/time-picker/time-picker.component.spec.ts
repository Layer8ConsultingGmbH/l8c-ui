import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cTimePickerComponent } from './time-picker.component';

@Component({
  imports: [L8cTimePickerComponent],
  template: `<l8c-time-picker
    [(value)]="value"
    [step]="step()"
    [hourLabel]="'Stunden'"
    [minuteLabel]="'Minuten'"
    [listLabel]="'Uhrzeit wählen'"
  />`,
})
class HostComponent {
  value = signal('');
  step = signal(30);
}

describe('L8cTimePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const segments = (): HTMLInputElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('input'));
  const texts = (): string[] => segments().map((input) => input.value);
  const clock = (): HTMLButtonElement => fixture.nativeElement.querySelector('.clock-button');
  const options = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.time-option'));

  function type(digits: string): void {
    for (const digit of digits) {
      const element = document.activeElement as HTMLInputElement;
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

  it('renders two labelled segments and the clock button', () => {
    expect(segments().map((input) => input.getAttribute('aria-label'))).toEqual([
      'Stunden',
      'Minuten',
    ]);
    expect(texts()).toEqual(['', '']);
    expect(clock().getAttribute('aria-label')).toBe('Uhrzeit wählen');
  });

  it('types a time across both segments', () => {
    segments()[0].focus();
    type('1430');

    expect(texts()).toEqual(['14', '30']);
    expect(host.value()).toBe('14:30');
  });

  it('stops hours at 23 and minutes at 59', () => {
    segments()[0].focus();
    type('25');
    expect(texts()).toEqual(['02', '5']);

    segments()[1].focus();
    segments()[1].value = '';
    segments()[1].dispatchEvent(new Event('input'));
    type('7');
    // A 7 can never become a valid two-digit minute; it is padded on blur
    expect(texts()).toEqual(['02', '7']);
    segments()[1].blur();
    fixture.detectChanges();
    expect(texts()).toEqual(['02', '07']);
    expect(host.value()).toBe('02:07');
  });

  it('shows a bound value and stays empty for anything else', () => {
    host.value.set('09:05');
    fixture.detectChanges();
    expect(texts()).toEqual(['09', '05']);

    host.value.set('25:00');
    fixture.detectChanges();
    expect(texts()).toEqual(['', '']);
  });

  it('lists times by step, marks the current one and picks by click', () => {
    host.value.set('14:30');
    fixture.detectChanges();
    clock().click();
    fixture.detectChanges();

    expect(options().length).toBe(48);
    expect(options()[0].textContent?.trim()).toBe('00:00');
    expect(
      options()
        .find((o) => o.getAttribute('aria-selected') === 'true')
        ?.textContent?.trim(),
    ).toBe('14:30');

    options()[3].click();
    fixture.detectChanges();

    expect(host.value()).toBe('01:30');
    expect(texts()).toEqual(['01', '30']);
    expect(options()).toEqual([]);
  });

  it('lists every quarter of an hour with step 15', () => {
    host.step.set(15);
    fixture.detectChanges();
    clock().click();
    fixture.detectChanges();

    expect(options().length).toBe(96);
    expect(options()[1].textContent?.trim()).toBe('00:15');
  });

  it('closes the list on Escape', () => {
    clock().click();
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('.time-list')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(options()).toEqual([]);
  });
});

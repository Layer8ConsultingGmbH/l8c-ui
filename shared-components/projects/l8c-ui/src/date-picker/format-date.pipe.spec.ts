import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { L8cFormatDatePipe } from './format-date.pipe';

@Component({
  imports: [L8cFormatDatePipe],
  template: `<span>{{ value() | l8cFormatDate: lang() }}</span>`,
})
class HostComponent {
  value = signal<string | Date | null | undefined>('2026-03-07');
  lang = signal<string | null | undefined>(undefined);
}

describe('L8cFormatDatePipe', () => {
  const pipe = new L8cFormatDatePipe();

  it('formats ISO dates in the given language', () => {
    expect(pipe.transform('2026-03-07')).toBe('07 Mar 2026');
    expect(pipe.transform('2026-10-07', 'de')).toBe('07 Okt 2026');
    expect(pipe.transform(new Date(2026, 11, 24), 'en')).toBe('24 Dec 2026');
  });

  it('returns empty for empty input and leaves invalid text unchanged', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('07.03.2026')).toBe('07.03.2026');
  });

  it('renders in a template and follows language changes', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const span = (): string => fixture.nativeElement.querySelector('span').textContent;

    expect(span()).toBe('07 Mar 2026');

    fixture.componentInstance.value.set('2026-10-07');
    fixture.componentInstance.lang.set('de');
    fixture.detectChanges();
    expect(span()).toBe('07 Okt 2026');

    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    expect(span()).toBe('');
  });
});

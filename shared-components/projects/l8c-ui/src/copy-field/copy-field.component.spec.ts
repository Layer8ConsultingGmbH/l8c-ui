import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { L8cButtonComponent } from '../button/button.component';
import { L8cCopyFieldComponent } from './copy-field.component';

const USER_ID = '3f2b8c1e-7d4a-4e9b-9c6f-1a2b3c4d5e6f';

@Component({
  imports: [L8cCopyFieldComponent],
  template: `
    <l8c-copy-field
      [label]="'User ID'"
      [value]="value()"
      [copyLabel]="'Copy user ID'"
      [copiedMessage]="'User ID copied'"
      (copiedValue)="copies.push($event)"
    />
  `,
})
class HostComponent {
  value = signal(USER_ID);
  copies: string[] = [];
}

describe('L8cCopyFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let field: L8cCopyFieldComponent;
  let writeText: ReturnType<typeof vi.fn>;

  const query = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const box = () => query('.copy-field-box');
  const value = () => query('.copy-field-value');
  const button = () => query('.copy-field-button button') as HTMLButtonElement;
  const feedback = () => query('[role="status"]');
  const buttonIcon = (): string =>
    fixture.debugElement.query(By.directive(L8cButtonComponent)).componentInstance.icon();

  function mockClipboard(clipboard: unknown): void {
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
  }

  beforeEach(async () => {
    writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    field = fixture.debugElement.query(By.directive(L8cCopyFieldComponent)).componentInstance;
  });

  it('shows the label and the value with the copy button inside the box after the value', () => {
    expect(query('.copy-field-label').textContent?.trim()).toBe('User ID');
    expect(value().textContent?.trim()).toBe(USER_ID);
    expect(box().lastElementChild).toBe(query('.copy-field-button'));
  });

  it('names the box after the label for screen readers', () => {
    const label = query('.copy-field-label');

    expect(box().getAttribute('role')).toBe('group');
    expect(label.id).not.toBe('');
    expect(box().getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('gives the copy button its accessible name and tooltip', () => {
    expect(button().getAttribute('aria-label')).toBe('Copy user ID');
    expect(query('.copy-field-button').getAttribute('title')).toBe('Copy user ID');
  });

  it('copies the value when the button is clicked', () => {
    button().click();

    expect(writeText).toHaveBeenCalledWith(USER_ID);
  });

  it('shows the check mark and the confirmation for two seconds and reports the copy', async () => {
    expect(buttonIcon()).toBe('copy');

    vi.useFakeTimers();
    try {
      await field.copy();
      fixture.detectChanges();

      expect(field.copied()).toBe(true);
      expect(buttonIcon()).toBe('check');
      expect(feedback().textContent?.trim()).toBe('User ID copied');
      expect(fixture.componentInstance.copies).toEqual([USER_ID]);

      vi.advanceTimersByTime(2000);
      fixture.detectChanges();

      expect(field.copied()).toBe(false);
      expect(buttonIcon()).toBe('copy');
      expect(feedback().textContent?.trim()).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the status region in the DOM while there is nothing to announce', () => {
    expect(feedback()).toBeTruthy();
    expect(feedback().textContent?.trim()).toBe('');
  });

  it('makes the copy button the only tab stop', () => {
    const focusable = fixture.nativeElement.querySelectorAll(
      'button, input, textarea, select, a[href], [tabindex], [contenteditable]',
    );
    expect(Array.from(focusable)).toEqual([button()]);
    expect(button().type).toBe('button');
  });

  it('shows no confirmation when the clipboard is denied or missing', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    await field.copy();
    expect(field.copied()).toBe(false);

    mockClipboard(undefined);
    await field.copy();
    expect(field.copied()).toBe(false);
  });

  it('copies nothing while the value is empty', async () => {
    fixture.componentInstance.value.set('');
    fixture.detectChanges();

    await field.copy();

    expect(writeText).not.toHaveBeenCalled();
    expect(field.copied()).toBe(false);
  });
});

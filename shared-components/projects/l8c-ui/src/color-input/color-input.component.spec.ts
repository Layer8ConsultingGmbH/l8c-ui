import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { L8cColorInputComponent } from './color-input.component';

@Component({
  imports: [L8cColorInputComponent, ReactiveFormsModule],
  template: `
    <l8c-color-input [label]="'Primary'" [invalidMessage]="'Not a color'" [formControl]="control" />
  `,
})
class HostComponent {
  control = new FormControl('#2a7ab8', { nonNullable: true });
}

describe('L8cColorInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const text = (): HTMLInputElement => fixture.nativeElement.querySelector('input[type="text"]');
  const picker = (): HTMLInputElement => fixture.nativeElement.querySelector('input[type="color"]');
  const swatch = (): HTMLButtonElement => fixture.nativeElement.querySelector('.color-swatch');
  const fill = (): HTMLElement => fixture.nativeElement.querySelector('.color-swatch-fill');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the form value in the text field, the swatch and the picker', () => {
    expect(text().value).toBe('#2a7ab8');
    expect(text().getAttribute('aria-label')).toBe('Primary');
    expect(swatch().getAttribute('aria-label')).toBe('Primary: #2a7ab8');
    expect(picker().value).toBe('#2a7ab8');
    expect(fill().classList.contains('invalid')).toBe(false);
  });

  it('writes typed text to the form as typed', () => {
    text().value = 'rgba(255, 255, 255, 0.08)';
    text().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.control.value).toBe('rgba(255, 255, 255, 0.08)');
    // Not a hex value: the picker keeps a neutral color
    expect(picker().value).toBe('#000000');
  });

  it('writes the picked color to the form', () => {
    picker().value = '#ff0066';
    picker().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.control.value).toBe('#ff0066');
    expect(text().value).toBe('#ff0066');
  });

  it('expands #rgb for the picker', () => {
    host.control.setValue('#fff');
    fixture.detectChanges();

    expect(picker().value).toBe('#ffffff');
  });

  it('marks a value the browser cannot read as a color', () => {
    host.control.setValue('not a color');
    fixture.detectChanges();

    expect(fill().classList.contains('invalid')).toBe(true);
    expect(text().getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.error-message')?.textContent?.trim()).toBe(
      'Not a color',
    );
  });

  it('opens the picker from the swatch and follows the disabled state', () => {
    const click = vi.spyOn(picker(), 'click');
    swatch().click();
    expect(click).toHaveBeenCalledTimes(1);

    host.control.disable();
    fixture.detectChanges();
    expect(text().disabled).toBe(true);
    expect(swatch().disabled).toBe(true);
    swatch().click();
    expect(click).toHaveBeenCalledTimes(1);
  });
});

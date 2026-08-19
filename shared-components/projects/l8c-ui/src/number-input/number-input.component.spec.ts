import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cNumberInputComponent } from './number-input.component';

describe('L8cNumberInputComponent', () => {
  let component: L8cNumberInputComponent;
  let fixture: ComponentFixture<L8cNumberInputComponent>;

  function typeValue(text: string) {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cNumberInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit valueChange and call the registered onChange on typing', () => {
    let emitted: number | undefined;
    let cvaValue: number | undefined;
    component.valueChange.subscribe((value) => (emitted = value));
    component.registerOnChange((value: number) => (cvaValue = value));

    typeValue('42');

    expect(emitted).toBe(42);
    expect(cvaValue).toBe(42);
    expect(component.value()).toBe(42);
  });

  it('should fall back to 0 for unparsable input', () => {
    typeValue('abc');
    expect(component.value()).toBe(0);
  });

  it('should format the display value with the configured decimals', () => {
    fixture.componentRef.setInput('decimals', 2);
    component.writeValue(3.5);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('3.50');
  });

  it('should keep the raw text while typing and reformat on blur', () => {
    fixture.componentRef.setInput('decimals', 2);
    typeValue('3.456');

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('3.456');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.value).toBe('3.46');
  });

  it('should step with the arrow buttons using the configured step', () => {
    fixture.componentRef.setInput('step', 5);
    component.writeValue(10);
    fixture.detectChanges();

    const [up, down] = fixture.nativeElement.querySelectorAll('button');
    up.click();
    expect(component.value()).toBe(15);
    down.click();
    down.click();
    expect(component.value()).toBe(5);
  });

  it('should clamp the value to min and max', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.detectChanges();

    typeValue('99');
    expect(component.value()).toBe(10);

    component.writeValue(0);
    fixture.detectChanges();
    const [, down] = fixture.nativeElement.querySelectorAll('button');
    down.click();
    expect(component.value()).toBe(0);
  });

  it('should update the value via writeValue and reset invalid values to 0', () => {
    component.writeValue(7);
    expect(component.value()).toBe(7);

    component.writeValue(null);
    expect(component.value()).toBe(0);
  });

  it('should disable the field and the arrows via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons.every((btn) => btn.disabled)).toBe(true);
  });

  it('should call onTouched on blur', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(touched).toBe(true);
  });

  it('should render suffix and hint when set', () => {
    fixture.componentRef.setInput('suffix', '%');
    fixture.componentRef.setInput('hint', 'Enter a whole number');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.number-suffix').textContent.trim()).toBe('%');
    expect(fixture.nativeElement.querySelector('.number-hint').textContent.trim()).toBe(
      'Enter a whole number',
    );
  });
});

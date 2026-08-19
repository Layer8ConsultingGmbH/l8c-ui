import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cInputComponent } from './input.component';

describe('L8cInputComponent', () => {
  let component: L8cInputComponent;
  let fixture: ComponentFixture<L8cInputComponent>;

  function inputElement(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function typeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
    element.value = value;
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label with required indicator', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.input-label');
    expect(label.textContent).toContain('Email');
    expect(fixture.nativeElement.querySelector('.required-indicator')).toBeTruthy();
  });

  it('should pass type, placeholder and length constraints to the input', () => {
    fixture.componentRef.setInput('type', 'email');
    fixture.componentRef.setInput('placeholder', 'name@example.com');
    fixture.componentRef.setInput('maxLength', 50);
    fixture.componentRef.setInput('minLength', 5);
    fixture.detectChanges();

    expect(inputElement().type).toBe('email');
    expect(inputElement().placeholder).toBe('name@example.com');
    expect(inputElement().getAttribute('maxlength')).toBe('50');
    expect(inputElement().getAttribute('minlength')).toBe('5');
  });

  it('should emit valueChange and call the registered onChange on input', () => {
    let emitted: string | undefined;
    let cvaValue: string | undefined;
    component.valueChange.subscribe((value) => (emitted = value));
    component.registerOnChange((value: string) => (cvaValue = value));

    typeValue(inputElement(), 'hello');

    expect(emitted).toBe('hello');
    expect(cvaValue).toBe('hello');
    expect(component.value()).toBe('hello');
  });

  it('should update the value via writeValue', () => {
    component.writeValue('preset');
    expect(component.value()).toBe('preset');

    component.writeValue(null as unknown as string);
    expect(component.value()).toBe('');
  });

  it('should disable the input via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    expect(inputElement().disabled).toBe(true);
    expect(component.disabled()).toBe(true);
  });

  it('should track focus state and call onTouched on blur', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    const wrapper = fixture.nativeElement.querySelector('.input-wrapper');

    inputElement().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(component.isFocused()).toBe(true);
    expect(wrapper.classList.contains('focused')).toBe(true);

    inputElement().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.isFocused()).toBe(false);
    expect(touched).toBe(true);
  });

  it('should show the error message and error class', () => {
    fixture.componentRef.setInput('error', 'Invalid value');
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.input-wrapper');
    const error = fixture.nativeElement.querySelector('.error-message');
    expect(wrapper.classList.contains('error')).toBe(true);
    expect(error.textContent.trim()).toBe('Invalid value');
  });

  it('should render a textarea in multiline mode', () => {
    fixture.componentRef.setInput('multiline', true);
    fixture.componentRef.setInput('rows', 4);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    expect(textarea.getAttribute('rows')).toBe('4');
  });

  it('should emit values from the textarea and auto-adjust its height', () => {
    fixture.componentRef.setInput('multiline', true);
    fixture.detectChanges();
    let emitted: string | undefined;
    component.valueChange.subscribe((value) => (emitted = value));

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    typeValue(textarea, 'line 1\nline 2');

    expect(emitted).toBe('line 1\nline 2');
    expect(textarea.style.height).toBe(textarea.scrollHeight + 'px');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cSelectComponent, SelectOption } from './select.component';

describe('L8cSelectComponent', () => {
  let component: L8cSelectComponent;
  let fixture: ComponentFixture<L8cSelectComponent>;

  const options: SelectOption[] = [
    { value: 'de', label: 'German' },
    { value: 'en', label: 'English' },
  ];

  function selectValue(value: string) {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and required indicator', () => {
    fixture.componentRef.setInput('label', 'Language');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.select-label');
    expect(label.textContent).toContain('Language');
    expect(fixture.nativeElement.querySelector('.required-indicator')).toBeTruthy();
  });

  it('should render all options plus the placeholder option', () => {
    fixture.componentRef.setInput('placeholder', 'Choose...');
    fixture.detectChanges();

    const optionElements = fixture.nativeElement.querySelectorAll('option');
    expect(optionElements.length).toBe(3);
    expect(optionElements[0].textContent.trim()).toBe('Choose...');
    expect(optionElements[1].textContent.trim()).toBe('German');
  });

  it('should emit valueChange and call the registered onChange on selection', () => {
    let emitted: string | undefined;
    let cvaValue: string | undefined;
    component.valueChange.subscribe((value) => (emitted = value));
    component.registerOnChange((value: string) => (cvaValue = value));

    selectValue('en');

    expect(emitted).toBe('en');
    expect(cvaValue).toBe('en');
    expect(component.value()).toBe('en');
  });

  it('should reset to the placeholder after selection when a placeholder exists', async () => {
    fixture.componentRef.setInput('placeholder', 'Choose...');
    fixture.detectChanges();

    selectValue('en');
    expect(component.value()).toBe('en');

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(component.value()).toBe('');
  });

  it('should keep the selection when no placeholder exists', async () => {
    selectValue('en');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(component.value()).toBe('en');
  });

  it('should apply a value written before the options arrive', () => {
    fixture.componentRef.setInput('options', []);
    fixture.detectChanges();
    component.writeValue('en');
    fixture.detectChanges();

    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('en');
  });

  it('should update the value via writeValue', () => {
    component.writeValue('de');
    expect(component.value()).toBe('de');

    component.writeValue(null as unknown as string);
    expect(component.value()).toBe('');
  });

  it('should disable the select via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    expect(select.disabled).toBe(true);
    expect(component.disabled()).toBe(true);
  });

  it('should track focus state and call onTouched on blur', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    const select = fixture.nativeElement.querySelector('select');

    select.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(component.isFocused()).toBe(true);

    select.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.isFocused()).toBe(false);
    expect(touched).toBe(true);
  });

  it('should show the error message', () => {
    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.error-message');
    expect(error.textContent.trim()).toBe('Required field');
  });
});

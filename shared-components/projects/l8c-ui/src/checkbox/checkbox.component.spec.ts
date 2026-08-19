import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cCheckboxComponent } from './checkbox.component';

describe('L8cCheckboxComponent', () => {
  let component: L8cCheckboxComponent;
  let fixture: ComponentFixture<L8cCheckboxComponent>;

  function clickCheckbox() {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle and emit checkedChange on change', () => {
    let emitted: boolean | undefined;
    component.checked.subscribe((value) => (emitted = value));

    clickCheckbox();
    expect(component.checked()).toBe(true);
    expect(emitted).toBe(true);

    clickCheckbox();
    expect(component.checked()).toBe(false);
    expect(emitted).toBe(false);
  });

  it('should render the checkmark only when checked', () => {
    expect(fixture.nativeElement.querySelector('.checkmark')).toBeFalsy();

    clickCheckbox();
    expect(fixture.nativeElement.querySelector('.checkmark')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.checkbox-box').classList).toContain('checked');
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    clickCheckbox();
    expect(component.checked()).toBe(false);
  });

  it('should reflect an initial checked input', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.checked).toBe(true);
  });
});

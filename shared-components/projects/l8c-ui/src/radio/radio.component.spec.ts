import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cRadioComponent } from './radio.component';

describe('L8cRadioComponent', () => {
  let component: L8cRadioComponent;
  let fixture: ComponentFixture<L8cRadioComponent>;

  function selectRadio() {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cRadioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check and emit checkedChange on selection', () => {
    let emitted: boolean | undefined;
    component.checked.subscribe((value) => (emitted = value));

    selectRadio();
    expect(component.checked()).toBe(true);
    expect(emitted).toBe(true);
  });

  it('should apply the native group name', () => {
    fixture.componentRef.setInput('name', 'my-group');
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.name).toBe('my-group');
  });

  it('should render the plain appearance by default', () => {
    expect(fixture.nativeElement.querySelector('.radio-circle')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.radio-ring')).toBeFalsy();
  });

  it('should render the row appearance with the checked highlight', () => {
    fixture.componentRef.setInput('appearance', 'row');
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.radio-ring')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.radio-circle')).toBeFalsy();
    const row = fixture.nativeElement.querySelector('.radio-option');
    expect(row.classList).toContain('row');
    expect(row.classList).toContain('checked');
  });

  it('should show the dot only when checked', () => {
    expect(fixture.nativeElement.querySelector('.radio-dot')).toBeFalsy();

    selectRadio();
    expect(fixture.nativeElement.querySelector('.radio-dot')).toBeTruthy();
  });

  it('should not select when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    selectRadio();
    expect(component.checked()).toBe(false);
  });
});

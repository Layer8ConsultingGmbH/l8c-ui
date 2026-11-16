import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cSpinnerComponent } from './spinner.component';

describe('L8cSpinnerComponent', () => {
  let component: L8cSpinnerComponent;
  let fixture: ComponentFixture<L8cSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a medium spinner without overlay or message by default', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner');
    const container = fixture.nativeElement.querySelector('.spinner-container');

    expect(spinner.classList.contains('spinner-small')).toBe(false);
    expect(spinner.classList.contains('spinner-large')).toBe(false);
    expect(container.classList.contains('spinner-overlay')).toBe(false);
    expect(fixture.nativeElement.querySelector('.spinner-message')).toBeNull();
  });

  it('should apply the size class', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.spinner');
    expect(spinner.classList.contains('spinner-large')).toBe(true);
  });

  it('should render as overlay', () => {
    fixture.componentRef.setInput('overlay', true);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.spinner-container');
    expect(container.classList.contains('spinner-overlay')).toBe(true);
  });

  it('should show the message when provided', () => {
    fixture.componentRef.setInput('message', 'Loading data...');
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.spinner-message');
    expect(message.textContent.trim()).toBe('Loading data...');
  });
  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => warn.mockRestore());

    it('falls back to the medium size for an unknown value', () => {
      fixture.componentRef.setInput('size', 'huge' as unknown as 'large');
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.classList.contains('spinner-small')).toBe(false);
      expect(spinner.classList.contains('spinner-large')).toBe(false);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('reads a bare overlay attribute and a numeric message', () => {
      fixture.componentRef.setInput('overlay', '');
      fixture.componentRef.setInput('message', 42);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.spinner-overlay')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.spinner-message').textContent.trim()).toBe('42');
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

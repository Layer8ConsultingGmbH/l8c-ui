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
});

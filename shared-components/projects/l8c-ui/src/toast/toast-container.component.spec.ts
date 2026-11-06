import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cToastContainerComponent } from './toast-container.component';
import { L8cToastService } from './toast.service';

describe('L8cToastContainerComponent', () => {
  let fixture: ComponentFixture<L8cToastContainerComponent>;
  let service: L8cToastService;

  const toasts = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('l8c-toast'));
  const dismissButton = (toast: HTMLElement): HTMLButtonElement | null =>
    toast.querySelector('.toast-dismiss button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cToastContainerComponent],
    }).compileComponents();
    service = TestBed.inject(L8cToastService);
    fixture = TestBed.createComponent(L8cToastContainerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(toasts()).toEqual([]);
  });

  it('shows the toasts oldest first with their tone and message', () => {
    service.info('Applied');
    service.success('Saved');
    service.error('Not saved');
    fixture.detectChanges();

    expect(toasts().map((toast) => toast.getAttribute('data-tone'))).toEqual([
      'info',
      'success',
      'error',
    ]);
    expect(toasts().map((toast) => toast.querySelector('.toast-message')?.textContent)).toEqual([
      'Applied',
      'Saved',
      'Not saved',
    ]);
  });

  it('uses role status for info and success and role alert for errors', () => {
    service.info('Applied');
    service.success('Saved');
    service.error('Not saved');
    fixture.detectChanges();

    expect(toasts().map((toast) => toast.getAttribute('role'))).toEqual([
      'status',
      'status',
      'alert',
    ]);
  });

  it('shows the circle-check icon for info and success and circle-alert for errors', () => {
    service.success('Saved');
    service.error('Not saved');
    fixture.detectChanges();

    const firstPath = (toast: HTMLElement) =>
      toast.querySelector('.toast-icon svg > *:first-child')?.tagName.toLowerCase();
    const [success, error] = toasts();
    // circle-check starts with a circle, circle-alert with a circle too, so
    // tell them apart by the number of shapes (2 vs 3)
    expect(firstPath(success)).toBe('circle');
    expect(success.querySelectorAll('.toast-icon svg > *').length).toBe(2);
    expect(error.querySelectorAll('.toast-icon svg > *').length).toBe(3);
  });

  it('gives only error toasts a dismiss button, labelled with dismissLabel', () => {
    fixture.componentRef.setInput('dismissLabel', 'Schließen');
    service.success('Saved');
    service.error('Not saved');
    fixture.detectChanges();

    const [success, error] = toasts();
    expect(dismissButton(success)).toBeNull();
    expect(dismissButton(error)?.getAttribute('aria-label')).toBe('Schließen');
    expect(error.querySelector('.toast-dismiss')?.getAttribute('title')).toBe('Schließen');
  });

  it('removes an error toast when its dismiss button is clicked', () => {
    service.error('Not saved');
    fixture.detectChanges();

    dismissButton(toasts()[0])!.click();
    fixture.detectChanges();

    expect(toasts()).toEqual([]);
    expect(service.toasts()).toEqual([]);
  });

  it('does not move the focus when a toast appears', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();

    service.error('Not saved');
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
    button.remove();
  });
});

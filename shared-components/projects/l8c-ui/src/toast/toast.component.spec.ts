import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cToastComponent } from './toast.component';
import { ToastTone } from './toast.service';

describe('L8cToastComponent', () => {
  let fixture: ComponentFixture<L8cToastComponent>;
  let component: L8cToastComponent;

  const host = (): HTMLElement => fixture.nativeElement;
  const dismissButton = (): HTMLButtonElement | null =>
    host().querySelector('.toast-dismiss button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [L8cToastComponent] }).compileComponents();
    fixture = TestBed.createComponent(L8cToastComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tone', 'info');
    fixture.componentRef.setInput('message', 'Applied');
    fixture.detectChanges();
  });

  it('renders the message and the tone', () => {
    expect(host().querySelector('.toast-message')?.textContent).toBe('Applied');
    expect(host().getAttribute('data-tone')).toBe('info');
    expect(host().querySelector('.toast-icon svg')).toBeTruthy();
  });

  it('uses role status for info and success and role alert for errors', () => {
    const roles: Record<ToastTone, string> = { info: 'status', success: 'status', error: 'alert' };
    for (const [tone, role] of Object.entries(roles)) {
      fixture.componentRef.setInput('tone', tone);
      fixture.detectChanges();
      expect(host().getAttribute('role')).toBe(role);
    }
  });

  it('shows a dismiss button only on error toasts, labelled with dismissLabel', () => {
    fixture.componentRef.setInput('dismissLabel', 'Dismiss');
    fixture.detectChanges();
    expect(dismissButton()).toBeNull();

    fixture.componentRef.setInput('tone', 'error');
    fixture.detectChanges();

    expect(dismissButton()?.getAttribute('aria-label')).toBe('Dismiss');
    expect(host().querySelector('.toast-dismiss')?.getAttribute('title')).toBe('Dismiss');
  });

  it('emits dismissed when the dismiss button is clicked', () => {
    let dismissed = 0;
    component.dismissed.subscribe(() => dismissed++);
    fixture.componentRef.setInput('tone', 'error');
    fixture.detectChanges();

    dismissButton()!.click();

    expect(dismissed).toBe(1);
  });

  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('reads an unknown tone as info and warns', () => {
      fixture.componentRef.setInput('tone', 'fatal' as unknown as ToastTone);
      fixture.detectChanges();

      expect(component.tone()).toBe('info');
      expect(host().getAttribute('role')).toBe('status');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('stringifies a numeric message and reads null as an empty string', () => {
      fixture.componentRef.setInput('message', 42 as unknown as string);
      fixture.detectChanges();
      expect(host().querySelector('.toast-message')?.textContent).toBe('42');

      fixture.componentRef.setInput('message', null as unknown as string);
      fixture.detectChanges();
      expect(component.message()).toBe('');
      expect(warn).not.toHaveBeenCalled();
    });

    it('falls back to an empty dismissLabel for an object and warns', () => {
      fixture.componentRef.setInput('dismissLabel', {} as unknown as string);
      fixture.detectChanges();

      expect(component.dismissLabel()).toBe('');
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});

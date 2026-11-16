import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cConfirmDialogComponent } from './confirm-dialog.component';
import { L8cDialogComponent } from '../dialog/dialog.component';

describe('L8cConfirmDialogComponent', () => {
  let component: L8cConfirmDialogComponent;
  let fixture: ComponentFixture<L8cConfirmDialogComponent>;
  let dialogStub: Pick<L8cDialogComponent, 'open' | 'close'>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // The native <dialog> API is not available in the test environment
    dialogStub = { open: () => {}, close: () => {} };
    component.dialog = dialogStub as L8cDialogComponent;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply title, message and the confirm label override on open', () => {
    component.open('Delete user', 'Really delete?', 'Delete');

    expect(component.title()).toBe('Delete user');
    expect(component.message()).toBe('Really delete?');
    expect(component.displayConfirmLabel()).toBe('Delete');
  });

  it('should fall back to the confirmLabel input without an override', () => {
    fixture.componentRef.setInput('confirmLabel', 'OK then');
    component.open('Title', 'Message');

    expect(component.displayConfirmLabel()).toBe('OK then');
  });

  it('should emit confirmed on confirm and not cancelled', () => {
    let confirmedCount = 0;
    let cancelledCount = 0;
    component.confirmed.subscribe(() => confirmedCount++);
    component.cancelled.subscribe(() => cancelledCount++);

    component.open('Title', 'Message');
    component.onConfirm();

    expect(confirmedCount).toBe(1);
    expect(cancelledCount).toBe(0);
  });

  it('should emit cancelled when closed without confirming', () => {
    let cancelledCount = 0;
    component.cancelled.subscribe(() => cancelledCount++);

    component.open('Title', 'Message');
    component.close();

    expect(cancelledCount).toBe(1);
  });

  it('should reset the override on the next open without one', () => {
    component.open('Title', 'Message', 'Close');
    expect(component.displayConfirmLabel()).toBe('Close');

    component.open('Title', 'Message');
    expect(component.displayConfirmLabel()).toBe('OK');
  });

  describe('modes', () => {
    const buttonLabels = (): string[] =>
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.dialog-actions l8c-button'),
      ).map((button) => button.textContent?.trim() ?? '');

    it('shows the cancel and the confirm button by default', () => {
      expect(component.mode()).toBe('confirm');
      expect(buttonLabels()).toEqual(['Cancel', 'OK']);
    });

    it('shows only the close button in info mode', () => {
      fixture.componentRef.setInput('mode', 'info');
      fixture.componentRef.setInput('closeLabel', 'Got it');
      fixture.detectChanges();

      expect(buttonLabels()).toEqual(['Got it']);
    });

    it('emits closed, not cancelled or confirmed, when an info dialog closes', () => {
      fixture.componentRef.setInput('mode', 'info');
      fixture.detectChanges();
      const events: string[] = [];
      component.closed.subscribe(() => events.push('closed'));
      component.cancelled.subscribe(() => events.push('cancelled'));
      component.confirmed.subscribe(() => events.push('confirmed'));

      component.open('Title', 'Message');
      component.close();

      expect(events).toEqual(['closed']);
    });

    it('does not emit closed in confirm mode', () => {
      let closedCount = 0;
      component.closed.subscribe(() => closedCount++);

      component.open('Title', 'Message');
      component.close();
      component.open('Title', 'Message');
      component.onConfirm();

      expect(closedCount).toBe(0);
    });

    describe('closed by the browser (Escape)', () => {
      let events: string[];
      let nativeDialog: HTMLDialogElement;

      beforeEach(() => {
        // The real l8c-dialog instead of the stub, with the jsdom gaps filled
        fixture = TestBed.createComponent(L8cConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        nativeDialog = fixture.nativeElement.querySelector('dialog');
        nativeDialog.showModal = () => nativeDialog.setAttribute('open', '');
        nativeDialog.close = () => nativeDialog.removeAttribute('open');
        events = [];
        component.closed.subscribe(() => events.push('closed'));
        component.cancelled.subscribe(() => events.push('cancelled'));
        component.confirmed.subscribe(() => events.push('confirmed'));
      });

      it('emits cancelled in confirm mode', () => {
        component.open('Title', 'Message');
        nativeDialog.dispatchEvent(new Event('close'));

        expect(events).toEqual(['cancelled']);
      });

      it('emits closed in info mode', () => {
        fixture.componentRef.setInput('mode', 'info');
        fixture.detectChanges();
        component.open('Title', 'Message');
        nativeDialog.dispatchEvent(new Event('close'));

        expect(events).toEqual(['closed']);
      });

      it('emits each outcome once when a button closes the dialog', () => {
        component.open('Title', 'Message');
        component.onConfirm();
        nativeDialog.dispatchEvent(new Event('close'));
        component.open('Title', 'Message');
        component.close();
        nativeDialog.dispatchEvent(new Event('close'));

        expect(events).toEqual(['confirmed', 'cancelled']);
      });
    });

    it('falls back to confirm mode for an unknown mode and warns', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('mode', 'alert' as unknown as 'info');
      fixture.detectChanges();

      expect(component.mode()).toBe('confirm');
      expect(buttonLabels()).toEqual(['Cancel', 'OK']);
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });
  });

  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('falls back to the default labels for null and warns for objects', () => {
      fixture.componentRef.setInput('confirmLabel', null as unknown as string);
      fixture.componentRef.setInput('cancelLabel', {} as unknown as string);
      fixture.detectChanges();

      expect(component.confirmLabel()).toBe('OK');
      expect(component.cancelLabel()).toBe('Cancel');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('stringifies a numeric confirm label', () => {
      fixture.componentRef.setInput('confirmLabel', 1 as unknown as string);
      fixture.detectChanges();

      expect(component.displayConfirmLabel()).toBe('1');
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

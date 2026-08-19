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
});

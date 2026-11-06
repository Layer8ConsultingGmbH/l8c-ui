import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cDialogComponent } from './dialog.component';

describe('L8cDialogComponent', () => {
  let component: L8cDialogComponent;
  let fixture: ComponentFixture<L8cDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // jsdom does not implement showModal()/close() on <dialog>
    const dialog = component.dialogElement.nativeElement;
    dialog.showModal = () => dialog.setAttribute('open', '');
    dialog.close = () => dialog.removeAttribute('open');
  });

  function isDialogOpen(): boolean {
    return component.dialogElement.nativeElement.hasAttribute('open');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    fixture.componentRef.setInput('title', 'Confirm deletion');
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('.lib-dialog-header h2');
    expect(heading.textContent.trim()).toBe('Confirm deletion');
  });

  it('should show the close button by default', () => {
    expect(fixture.nativeElement.querySelector('.close-button')).toBeTruthy();
  });

  it('should hide the close button when showCloseButton is false', () => {
    fixture.componentRef.setInput('showCloseButton', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.close-button')).toBeNull();
  });

  it('should open the native dialog via open()', () => {
    component.open();

    expect(isDialogOpen()).toBe(true);
  });

  it('should close the native dialog and emit closed via close()', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => (closedEmitted = true));

    component.open();
    component.close();

    expect(isDialogOpen()).toBe(false);
    expect(closedEmitted).toBe(true);
  });

  it('should inherit the width by default and set --dialog-width from the input', () => {
    const dialog = component.dialogElement.nativeElement;
    expect(dialog.style.getPropertyValue('--dialog-width')).toBe('');

    fixture.componentRef.setInput('width', 720);
    fixture.detectChanges();
    expect(dialog.style.getPropertyValue('--dialog-width')).toBe('720px');

    fixture.componentRef.setInput('width', 'min(90vw, 60rem)');
    fixture.detectChanges();
    expect(dialog.style.getPropertyValue('--dialog-width')).toBe('min(90vw, 60rem)');

    fixture.componentRef.setInput('width', undefined);
    fixture.detectChanges();
    expect(dialog.style.getPropertyValue('--dialog-width')).toBe('');
  });

  it('should mark the flex content layout', () => {
    const dialog = component.dialogElement.nativeElement;
    expect(dialog.classList.contains('content-flex')).toBe(false);

    fixture.componentRef.setInput('contentLayout', 'flex');
    fixture.detectChanges();
    expect(dialog.classList.contains('content-flex')).toBe(true);
  });

  it('should close when the close button is clicked', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => (closedEmitted = true));
    component.open();

    fixture.nativeElement.querySelector('.close-button').click();

    expect(isDialogOpen()).toBe(false);
    expect(closedEmitted).toBe(true);
  });
});

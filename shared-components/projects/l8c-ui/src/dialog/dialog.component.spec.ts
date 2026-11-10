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

  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('ignores a width that is no CSS length and warns', () => {
      const dialog = component.dialogElement.nativeElement;
      fixture.componentRef.setInput('width', 'wide' as unknown as number);
      fixture.detectChanges();
      expect(dialog.style.getPropertyValue('--dialog-width')).toBe('');

      fixture.componentRef.setInput('width', -10);
      fixture.detectChanges();
      expect(dialog.style.getPropertyValue('--dialog-width')).toBe('');
      expect(warn).toHaveBeenCalledTimes(2);
    });

    it('reads an unknown contentLayout as scroll and warns', () => {
      fixture.componentRef.setInput('contentLayout', 'grid' as unknown as 'flex');
      fixture.detectChanges();

      expect(component.contentLayout()).toBe('scroll');
      expect(component.dialogElement.nativeElement.classList.contains('content-flex')).toBe(false);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('reads the bare showCloseButton attribute as true and other text as the default', () => {
      fixture.componentRef.setInput('showCloseButton', '' as unknown as boolean);
      fixture.detectChanges();
      expect(component.showCloseButton()).toBe(true);
      expect(warn).not.toHaveBeenCalled();

      fixture.componentRef.setInput('showCloseButton', 'nope' as unknown as boolean);
      fixture.detectChanges();
      expect(component.showCloseButton()).toBe(true);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('stringifies a numeric title', () => {
      fixture.componentRef.setInput('title', 7 as unknown as string);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.lib-dialog-header h2').textContent.trim()).toBe(
        '7',
      );
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

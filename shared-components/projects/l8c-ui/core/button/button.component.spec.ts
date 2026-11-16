import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cButtonComponent } from './button.component';

describe('L8cButtonComponent', () => {
  let component: L8cButtonComponent;
  let fixture: ComponentFixture<L8cButtonComponent>;

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to a nav button of default size', () => {
    expect(button().classList.contains('btn-nav')).toBe(true);
    expect(button().classList.contains('btn-default')).toBe(true);
    expect(button().type).toBe('button');
  });

  it('should apply action, size and tone classes', () => {
    fixture.componentRef.setInput('action', 'danger');
    fixture.componentRef.setInput('size', 'mini');
    fixture.componentRef.setInput('tone', 'warning');
    fixture.detectChanges();

    expect(button().classList.contains('btn-danger')).toBe(true);
    expect(button().classList.contains('btn-mini')).toBe(true);
    expect(button().classList.contains('tone-warning')).toBe(true);
  });

  it('should mark the active state', () => {
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    expect(button().classList.contains('btn-active')).toBe(true);
  });

  it('should render no icon by default', () => {
    expect(fixture.nativeElement.querySelector('l8c-icon')).toBeNull();
    expect(button().classList.contains('btn-icon-only')).toBe(false);
  });

  it('should render an icon sized by the button size', () => {
    fixture.componentRef.setInput('icon', 'plus');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('l8c-icon svg');
    expect(svg.getAttribute('width')).toBe('22');
    expect(button().classList.contains('btn-icon-only')).toBe(true);
  });

  it('should set the submit type and aria-label', () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.componentRef.setInput('ariaLabel', 'Save changes');
    fixture.detectChanges();

    expect(button().type).toBe('submit');
    expect(button().getAttribute('aria-label')).toBe('Save changes');
  });

  it('should emit clicked on click', () => {
    let clicked = false;
    component.clicked.subscribe(() => (clicked = true));

    button().click();

    expect(clicked).toBe(true);
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let clicked = false;
    component.clicked.subscribe(() => (clicked = true));

    button().click();

    expect(button().disabled).toBe(true);
    expect(clicked).toBe(false);
  });

  it('should toggle the hover class on mouseenter/mouseleave', () => {
    const host: HTMLElement = fixture.nativeElement;

    host.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(host.classList.contains('button-hovered')).toBe(true);

    host.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(host.classList.contains('button-hovered')).toBe(false);
  });
  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => warn.mockRestore());

    it('falls back to the defaults for unknown action, size, tone and type', () => {
      fixture.componentRef.setInput('action', 'huge' as unknown as 'nav');
      fixture.componentRef.setInput('size', 'xl' as unknown as 'mini');
      fixture.componentRef.setInput('tone', 'pink' as unknown as 'danger');
      fixture.componentRef.setInput('type', 'reset' as unknown as 'button');
      fixture.detectChanges();

      expect(button().classList.contains('btn-nav')).toBe(true);
      expect(button().classList.contains('btn-default')).toBe(true);
      expect(component.tone()).toBe('default');
      expect(button().type).toBe('button');
      expect(warn).toHaveBeenCalledTimes(4);
    });

    it('ignores an unknown icon name', () => {
      fixture.componentRef.setInput('icon', 'no-such-icon' as unknown as 'x');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('l8c-icon')).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('reads a bare disabled attribute as true and rejects other text', () => {
      fixture.componentRef.setInput('disabled', '');
      fixture.detectChanges();
      expect(button().disabled).toBe(true);

      fixture.componentRef.setInput('disabled', 'yes');
      fixture.detectChanges();
      expect(button().disabled).toBe(false);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});

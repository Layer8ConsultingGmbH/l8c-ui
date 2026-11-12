import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cTooltipDirective, TooltipPlacement } from './tooltip.directive';

@Component({
  imports: [L8cTooltipDirective],
  template: `
    <button
      type="button"
      aria-label="Edit"
      aria-describedby="hint"
      [l8cTooltip]="text()"
      [tooltipPlacement]="'bottom'"
      [tooltipDelay]="100"
    >
      Edit
    </button>
    <span id="hint">Opens the editor</span>
  `,
})
class HostComponent {
  text = signal<string | null>('Edit questionnaire');
}

@Component({
  imports: [L8cTooltipDirective],
  template: `
    <button type="button" [l8cTooltip]="text" [tooltipPlacement]="placement" [tooltipDelay]="delay">
      Edit
    </button>
  `,
})
class ValidationHostComponent {
  // Values a strictly typed template would reject, as they come from untyped data
  text = 42 as unknown as string;
  placement = 'diagonal' as unknown as TooltipPlacement;
  delay = -5;
}

describe('L8cTooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');
  const tooltip = (): HTMLElement | null => document.body.querySelector('[role="tooltip"]');

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
    expect(tooltip()).toBeNull();
  });

  it('shows the hint after the delay on hover and describes the element', () => {
    button().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(99);
    expect(tooltip()).toBeNull();

    vi.advanceTimersByTime(1);

    expect(tooltip()?.textContent).toBe('Edit questionnaire');
    expect(tooltip()?.getAttribute('data-placement')).toBe('bottom');
    expect(tooltip()?.style.position).toBe('fixed');
    // The existing description stays, the tooltip is added to it
    expect(button().getAttribute('aria-describedby')).toBe(`hint ${tooltip()!.id}`);
    // The accessible name is untouched
    expect(button().getAttribute('aria-label')).toBe('Edit');
  });

  it('hides on leave and puts the description back', () => {
    button().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(100);
    expect(tooltip()).not.toBeNull();

    button().dispatchEvent(new Event('mouseleave'));

    expect(tooltip()).toBeNull();
    expect(button().getAttribute('aria-describedby')).toBe('hint');
  });

  it('shows on keyboard focus and hides on Escape', () => {
    button().dispatchEvent(new Event('focusin'));
    vi.advanceTimersByTime(100);
    expect(tooltip()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(tooltip()).toBeNull();
  });

  it('does not show while leaving before the delay is over', () => {
    button().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(50);
    button().dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(100);

    expect(tooltip()).toBeNull();
  });

  it('shows nothing for an empty text', () => {
    host.text.set('  ');
    fixture.detectChanges();

    button().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(100);

    expect(tooltip()).toBeNull();
    expect(button().getAttribute('aria-describedby')).toBe('hint');
  });

  it('removes the tooltip when the element is destroyed', () => {
    button().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(100);
    expect(tooltip()).not.toBeNull();

    fixture.destroy();

    expect(tooltip()).toBeNull();
  });

  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('reads an unknown placement as top, a negative delay as 0 and a number as text', () => {
      const validation = TestBed.createComponent(ValidationHostComponent);
      validation.detectChanges();
      const directive = validation.debugElement
        .query((el) => el.name === 'button')
        .injector.get(L8cTooltipDirective);

      expect(directive.placement()).toBe('top');
      expect(directive.delay()).toBe(0);
      expect(directive.text()).toBe('42');
      expect(warn).toHaveBeenCalledTimes(2);

      validation.destroy();
    });

    it('shows nothing for a null text without a warning', () => {
      host.text.set(null);
      fixture.detectChanges();

      button().dispatchEvent(new Event('mouseenter'));
      vi.advanceTimersByTime(100);

      expect(tooltip()).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

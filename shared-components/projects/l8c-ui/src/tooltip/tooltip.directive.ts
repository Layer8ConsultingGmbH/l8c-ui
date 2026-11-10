import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  inject,
  input,
} from '@angular/core';

import {
  NumberInput,
  StringInput,
  numberInput,
  oneOf,
  optionalStringInput,
} from '../shared/input-validation';

const TOOLTIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const;
export type TooltipPlacement = (typeof TOOLTIP_PLACEMENTS)[number];

let nextId = 0;

/** Gap between the element and its tooltip, in pixels */
const OFFSET = 6;

/**
 * Short text hint on hover and keyboard focus, for icon buttons and
 * truncated labels. Replaces native `title` attributes so the hint looks
 * the same in every browser and also shows on keyboard focus.
 *
 * The tooltip adds a description (`aria-describedby` while it shows), it
 * does not name the control - keep the element's own accessible name. It
 * is rendered into `<body>` with a fixed position, so it is never clipped
 * by a scrolling table or a dialog. Shows after `tooltipDelay` (300 ms),
 * hides on leave, blur or Escape. Text only, at most a short sentence.
 *
 * @example
 * <l8c-button [icon]="'pencil'" [ariaLabel]="'Edit'" [l8cTooltip]="'Edit questionnaire'" />
 */
@Directive({
  selector: '[l8cTooltip]',
})
export class L8cTooltipDirective {
  /** The hint; nothing shows while it is empty */
  text = input<string | undefined, StringInput>('', {
    alias: 'l8cTooltip',
    transform: optionalStringInput('l8cTooltip', 'l8cTooltip'),
  });
  /** Side of the element the tooltip sits on; no automatic flipping */
  placement = input<TooltipPlacement, TooltipPlacement | null | undefined>('top', {
    alias: 'tooltipPlacement',
    transform: oneOf('l8cTooltip', 'tooltipPlacement', TOOLTIP_PLACEMENTS, 'top'),
  });
  /** Delay before showing, in milliseconds */
  delay = input<number, NumberInput>(300, {
    alias: 'tooltipDelay',
    transform: numberInput('l8cTooltip', 'tooltipDelay', 300, { min: 0 }),
  });

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly id = `l8c-tooltip-${nextId++}`;

  private tooltip: HTMLElement | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  private describedByBefore: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  /** Whether the tooltip is showing right now */
  get isOpen(): boolean {
    return this.tooltip !== null;
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  protected onEnter(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.show(), Math.max(0, this.delay()));
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  @HostListener('mousedown')
  protected onLeave(): void {
    this.hide();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.hide();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  protected onViewportChange(): void {
    if (this.tooltip) {
      this.position(this.tooltip);
    }
  }

  private show(): void {
    const text = (this.text() ?? '').trim();
    if (this.tooltip || !text || typeof document === 'undefined') {
      return;
    }
    const element = this.host.nativeElement;
    const tooltip = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(tooltip, 'role', 'tooltip');
    this.renderer.setAttribute(tooltip, 'id', this.id);
    this.renderer.addClass(tooltip, 'l8c-tooltip');
    this.renderer.setAttribute(tooltip, 'data-placement', this.placement());
    this.renderer.appendChild(tooltip, this.renderer.createText(text));
    for (const [name, value] of Object.entries(TOOLTIP_STYLE)) {
      this.renderer.setStyle(tooltip, name, value);
    }
    this.renderer.appendChild(document.body, tooltip);
    this.tooltip = tooltip;
    this.position(tooltip);

    this.describedByBefore = element.getAttribute('aria-describedby');
    const described = [this.describedByBefore, this.id].filter(Boolean).join(' ');
    this.renderer.setAttribute(element, 'aria-describedby', described);
  }

  private hide(): void {
    clearTimeout(this.timer);
    if (!this.tooltip) {
      return;
    }
    this.renderer.removeChild(document.body, this.tooltip);
    this.tooltip = null;
    const element = this.host.nativeElement;
    if (this.describedByBefore) {
      this.renderer.setAttribute(element, 'aria-describedby', this.describedByBefore);
    } else {
      this.renderer.removeAttribute(element, 'aria-describedby');
    }
    this.describedByBefore = null;
  }

  /** Places the tooltip next to the element, kept inside the viewport */
  private position(tooltip: HTMLElement): void {
    const anchor = this.host.nativeElement.getBoundingClientRect();
    const size = tooltip.getBoundingClientRect();
    let top: number;
    let left: number;
    switch (this.placement()) {
      case 'bottom':
        top = anchor.bottom + OFFSET;
        left = anchor.left + anchor.width / 2 - size.width / 2;
        break;
      case 'left':
        top = anchor.top + anchor.height / 2 - size.height / 2;
        left = anchor.left - OFFSET - size.width;
        break;
      case 'right':
        top = anchor.top + anchor.height / 2 - size.height / 2;
        left = anchor.right + OFFSET;
        break;
      default:
        top = anchor.top - OFFSET - size.height;
        left = anchor.left + anchor.width / 2 - size.width / 2;
    }
    const maxLeft = Math.max(OFFSET, window.innerWidth - size.width - OFFSET);
    const maxTop = Math.max(OFFSET, window.innerHeight - size.height - OFFSET);
    this.renderer.setStyle(tooltip, 'top', `${Math.min(Math.max(OFFSET, top), maxTop)}px`);
    this.renderer.setStyle(tooltip, 'left', `${Math.min(Math.max(OFFSET, left), maxLeft)}px`);
  }
}

// The tooltip lives outside any component view, so its look is set inline
// from the design tokens (surface-3, border-strong, radius-sm, shadow-medium)
const TOOLTIP_STYLE: Record<string, string> = {
  position: 'fixed',
  'z-index': '1200',
  'box-sizing': 'border-box',
  width: 'max-content',
  'max-width': '260px',
  padding: '0.35rem 0.6rem',
  background: 'var(--surface-3, #1a2436)',
  color: 'var(--text, #e6e9f2)',
  border: '1px solid var(--border-strong, rgba(255, 255, 255, 0.16))',
  'border-radius': 'var(--radius-sm, 4px)',
  'box-shadow': 'var(--shadow-medium, 0 4px 12px rgba(0, 0, 0, 0.3))',
  'font-family': 'var(--font-family, system-ui, sans-serif)',
  'font-size': 'var(--font-size-xs, 0.75rem)',
  'font-weight': 'var(--font-weight-medium, 500)',
  'line-height': 'var(--line-height-normal, 1.4)',
  'white-space': 'normal',
  'pointer-events': 'none',
};

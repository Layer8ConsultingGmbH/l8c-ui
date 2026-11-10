import { PANEL_GAP, positionPanel, showPanel } from './popover';

describe('picker popover', () => {
  let anchor: HTMLElement;
  let panel: HTMLElement;

  function rect(element: HTMLElement, box: Partial<DOMRect>): void {
    const full = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, ...box };
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      ...full,
      x: full.left,
      y: full.top,
      toJSON: () => full,
    } as DOMRect);
  }

  beforeEach(() => {
    anchor = document.createElement('button');
    panel = document.createElement('div');
    document.body.append(anchor, panel);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200);
  });

  afterEach(() => {
    anchor.remove();
    panel.remove();
    vi.restoreAllMocks();
  });

  it('places the panel below the field, aligned to its left edge', () => {
    rect(anchor, { top: 100, bottom: 136, left: 200, width: 260 });
    rect(panel, { width: 284, height: 320 });

    positionPanel(anchor, panel);

    expect(panel.style.top).toBe(`${136 + PANEL_GAP}px`);
    expect(panel.style.left).toBe('200px');
    expect(panel.dataset['placement']).toBe('below');
  });

  it('flips above the field when there is not enough room below but more above', () => {
    rect(anchor, { top: 600, bottom: 636, left: 200, width: 260 });
    rect(panel, { width: 284, height: 320 });

    positionPanel(anchor, panel);

    expect(panel.style.top).toBe(`${600 - PANEL_GAP - 320}px`);
    expect(panel.dataset['placement']).toBe('above');
  });

  it('stays below when neither side has room but below has more', () => {
    rect(anchor, { top: 300, bottom: 336, left: 200, width: 260 });
    rect(panel, { width: 284, height: 600 });

    positionPanel(anchor, panel);

    expect(panel.dataset['placement']).toBe('below');
  });

  it('keeps the panel inside the viewport horizontally', () => {
    rect(anchor, { top: 100, bottom: 136, left: 1100, width: 80 });
    rect(panel, { width: 284, height: 320 });

    positionPanel(anchor, panel);
    expect(panel.style.left).toBe(`${1200 - 284 - PANEL_GAP}px`);

    rect(anchor, { top: 100, bottom: 136, left: -40, width: 80 });
    positionPanel(anchor, panel);
    expect(panel.style.left).toBe(`${PANEL_GAP}px`);
  });

  it('shows the popover when the browser supports it and tolerates a failure', () => {
    const show = vi.fn();
    (panel as HTMLElement & { showPopover: () => void }).showPopover = show;
    rect(anchor, { top: 100, bottom: 136, left: 200, width: 260 });
    rect(panel, { width: 284, height: 320 });

    const stop = showPanel(anchor, panel);
    expect(show).toHaveBeenCalledTimes(1);
    expect(panel.style.top).toBe(`${136 + PANEL_GAP}px`);
    stop();

    show.mockImplementation(() => {
      throw new Error('InvalidStateError');
    });
    expect(() => showPanel(anchor, panel)()).not.toThrow();
  });

  it('follows scrolling and resizing until stopped', () => {
    rect(anchor, { top: 100, bottom: 136, left: 200, width: 260 });
    rect(panel, { width: 284, height: 320 });
    const stop = showPanel(anchor, panel);

    rect(anchor, { top: 50, bottom: 86, left: 200, width: 260 });
    document.dispatchEvent(new Event('scroll'));
    expect(panel.style.top).toBe(`${86 + PANEL_GAP}px`);

    rect(anchor, { top: 20, bottom: 56, left: 200, width: 260 });
    window.dispatchEvent(new Event('resize'));
    expect(panel.style.top).toBe(`${56 + PANEL_GAP}px`);

    stop();
    rect(anchor, { top: 0, bottom: 36, left: 200, width: 260 });
    window.dispatchEvent(new Event('resize'));
    expect(panel.style.top).toBe(`${56 + PANEL_GAP}px`);
  });
});

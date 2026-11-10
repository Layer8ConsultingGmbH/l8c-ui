/**
 * Shared popover handling of l8c-date-picker and l8c-time-picker.
 *
 * The panel stays in the component's DOM (so its styles and the outside
 * click detection keep working) but is lifted into the browser's top layer
 * with the Popover API and placed in viewport coordinates. That way no
 * `overflow: hidden` or `transform` of a card or dialog around the field
 * can clip it. Browsers without the Popover API still get the fixed
 * position, only without the top layer.
 */

/** Space between the field and the panel, and to the viewport edges */
export const PANEL_GAP = 6;

/**
 * Places `panel` below `anchor`, or above it when there is more room there,
 * and keeps it inside the viewport horizontally.
 */
export function positionPanel(anchor: HTMLElement, panel: HTMLElement): void {
  const field = anchor.getBoundingClientRect();
  const size = panel.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const spaceBelow = viewportHeight - field.bottom - PANEL_GAP;
  const spaceAbove = field.top - PANEL_GAP;
  const above = size.height > spaceBelow && spaceAbove > spaceBelow;
  const top = above
    ? Math.max(PANEL_GAP, field.top - PANEL_GAP - size.height)
    : field.bottom + PANEL_GAP;
  const maxLeft = Math.max(PANEL_GAP, viewportWidth - size.width - PANEL_GAP);
  const left = Math.min(Math.max(PANEL_GAP, field.left), maxLeft);

  panel.style.top = `${Math.round(top)}px`;
  panel.style.left = `${Math.round(left)}px`;
  panel.dataset['placement'] = above ? 'above' : 'below';
}

/**
 * Shows `panel` in the top layer next to `anchor` and follows scrolling and
 * resizing while it is open. Returns the function that stops following;
 * call it when the panel closes.
 */
export function showPanel(anchor: HTMLElement, panel: HTMLElement): () => void {
  if (typeof panel.showPopover === 'function') {
    try {
      panel.showPopover();
    } catch {
      // Already shown or not connected: the position below still applies
    }
  }
  positionPanel(anchor, panel);

  const follow = (): void => positionPanel(anchor, panel);
  // Capture catches scrolling of any ancestor, not only the window
  document.addEventListener('scroll', follow, true);
  window.addEventListener('resize', follow);
  return () => {
    document.removeEventListener('scroll', follow, true);
    window.removeEventListener('resize', follow);
  };
}

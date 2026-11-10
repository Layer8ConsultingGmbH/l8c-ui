/**
 * Every icon the \l8c-icon\ component can render, in alphabetical order.
 * \circle-help\ is the older Lucide name of \circle-question-mark\ and
 * renders the same glyph.
 */
export const ICON_NAMES = [
  'add',
  'align-justify',
  'archive',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'ban',
  'bell',
  'calculator',
  'calendar',
  'calendar-days',
  'calendar-range',
  'check',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'chevrons-left',
  'chevrons-right',
  'chevrons-up-down',
  'circle-alert',
  'circle-check',
  'circle-help',
  'circle-question-mark',
  'circle-user',
  'clipboard-list',
  'clock',
  'contact',
  'copy',
  'copy-plus',
  'corner-up-left',
  'download',
  'external-link',
  'eye',
  'eye-off',
  'file-output',
  'filter',
  'filter-x',
  'funnel-x',
  'github',
  'globe',
  'grip-vertical',
  'hash',
  'house',
  'info',
  'languages',
  'layout-dashboard',
  'layout-grid',
  'list-checks',
  'lock',
  'log-out',
  'mail',
  'map-pin',
  'menu',
  'message-square',
  'moon',
  'more-horizontal',
  'more-vertical',
  'panel-left',
  'panel-left-close',
  'pencil',
  'percent',
  'play',
  'plus',
  'save',
  'search',
  'send',
  'server',
  'settings',
  'shield',
  'shield-check',
  'step-forward',
  'sun',
  'table',
  'toggle-left',
  'trash-2',
  'upload',
  'user',
  'user-plus',
  'users',
  'x',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** Older names that render the same glyph as the current name */
export const ICON_ALIASES: Partial<Record<IconName, IconName>> = {
  'circle-help': 'circle-question-mark',
};

const ICON_NAME_SET: ReadonlySet<string> = new Set(ICON_NAMES);

/** Whether \value\ is a known icon name; never throws */
export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && ICON_NAME_SET.has(value);
}

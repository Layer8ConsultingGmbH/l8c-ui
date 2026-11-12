/**
 * Texts of the brand editor. The shape matches the l8c-survey `brandEditor`
 * translation object, so a host can pass that object as it is; every key is
 * optional and falls back to the English default. `{{name}}` is replaced
 * with the configuration name.
 */
export interface BrandEditorLabels {
  title: string;
  intro: string;
  empty: string;
  description: { label: string; placeholder: string };
  selection: { label: string; none: string; active: string; hint: string };
  actions: { save: string; saving: string; reset: string; unsaved: string };
  general: { title: string; name: { label: string; placeholder: string; required: string } };
  configs: {
    new: string;
    newName: string;
    activate: string;
    isActive: string;
    delete: string;
    deleteTitle: string;
    deleteMessage: string;
    deleteActiveMessage: string;
  };
  discard: { title: string; message: string; confirm: string };
  logos: {
    title: string;
    dark: string;
    light: string;
    favicon: string;
    hint: string;
    choose: string;
    remove: string;
    tooLarge: string;
    unsupported: string;
    empty: string;
  };
  colors: {
    title: string;
    dark: string;
    light: string;
    active: string;
    group: { base: string; status: string };
    token: Record<string, { label: string; description: string }>;
  };
  typography: {
    title: string;
    fontFamily: { label: string; description: string };
    fontDisplay: { label: string; description: string };
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  designTokens: {
    title: string;
    radius: Record<string, string>;
    layout: { title: string };
    topNav: { minHeight: string };
    dropdown: { minWidth: string };
  };
}

/** Deep partial of the labels: what a host passes in */
export type BrandEditorLabelsInput = {
  [K in keyof BrandEditorLabels]?: BrandEditorLabels[K] extends string
    ? string
    : Partial<BrandEditorLabels[K]>;
};

export const BRAND_EDITOR_LABELS: BrandEditorLabels = {
  title: 'Branding',
  intro:
    'Colors, logos and typography of your organization. Whatever you select or edit here is previewed across the whole app until you discard it or leave the app. Everyone else only sees the active configuration.',
  empty:
    'Select a configuration above or create a new one. With nothing selected the app shows the active branding.',
  description: {
    label: 'Description (optional)',
    placeholder: 'What this branding is for, e.g. corporate colors for the 2026 relaunch',
  },
  selection: {
    label: 'Configuration',
    none: 'Nothing selected (active branding)',
    active: 'active',
    hint: 'The active configuration is what everyone sees; saving it applies at once. Without an active configuration the default branding applies.',
  },
  actions: {
    save: 'Save',
    saving: 'Saving...',
    reset: 'Discard changes',
    unsaved: 'Unsaved changes',
  },
  general: {
    title: 'General',
    name: { label: 'Name', placeholder: 'e.g. Corporate 2026', required: 'A name is required' },
  },
  configs: {
    new: 'New',
    newName: 'New configuration',
    activate: 'Activate',
    isActive: 'Active',
    delete: 'Delete',
    deleteTitle: 'Delete configuration',
    deleteMessage: 'Delete "{{name}}"?',
    deleteActiveMessage:
      'Delete "{{name}}"? It is the active branding; everyone will see the default branding afterwards.',
  },
  discard: {
    title: 'Discard unsaved changes?',
    message: 'Your changes to "{{name}}" will be lost.',
    confirm: 'Discard',
  },
  logos: {
    title: 'Logos',
    dark: 'Logo for the dark theme',
    light: 'Logo for the light theme',
    favicon: 'Favicon (browser tab)',
    hint: 'Logos as PNG, JPEG, WebP or SVG, the favicon as PNG, SVG or ICO, up to 200 KB each. Without a file the product logo and favicon are shown.',
    choose: 'Choose file',
    remove: 'Remove',
    tooLarge: 'The file is larger than 200 KB',
    unsupported: 'This file type is not supported',
    empty: 'No logo',
  },
  colors: {
    title: 'Theme colors',
    dark: 'Dark theme',
    light: 'Light theme',
    active: 'active',
    group: { base: 'Surfaces and text', status: 'Semantic and status colors' },
    token: {
      primary: {
        label: 'Primary',
        description: 'Primary buttons, links, active navigation items, focus rings',
      },
      'primary-hover': {
        label: 'Primary hover',
        description:
          'Lighter primary on hover: links, primary icon actions, hover fill of the question navigation',
      },
      'primary-dark': {
        label: 'Primary button hover',
        description: 'Fill of primary buttons and active paging buttons under the pointer',
      },
      'on-primary': {
        label: 'On primary',
        description: 'Text and icons on primary fills, e.g. button labels and check marks',
      },
      bg: { label: 'Background', description: 'Page background' },
      surface: { label: 'Surface', description: 'Cards, panels, dialogs, tables' },
      'surface-2': {
        label: 'Surface 2',
        description: 'Top navigation, input fields, secondary surfaces',
      },
      'surface-3': {
        label: 'Surface 3',
        description: 'Hover fill of icon buttons, nested and elevated surfaces',
      },
      text: { label: 'Text', description: 'Primary text' },
      'text-muted': { label: 'Muted text', description: 'Labels, captions, secondary text' },
      'text-faint': {
        label: 'Faint text',
        description:
          'Placeholders, disabled text, completed questions in the navigation, unchecked option rings',
      },
      border: { label: 'Border', description: 'Default hairline of cards, tables and inputs' },
      'border-strong': {
        label: 'Strong border',
        description: 'Emphasized borders, e.g. radio circles and hover borders',
      },
      success: {
        label: 'Success',
        description: 'Status Completed, success messages; pill tint and border follow',
      },
      warning: {
        label: 'Warning',
        description: 'Status In Progress, warnings; pill tint and border follow',
      },
      error: {
        label: 'Error',
        description: 'Errors, validation messages, delete actions; pill tint and border follow',
      },
      info: {
        label: 'Info',
        description: 'Status Ready, info badges and hints; pill tint and border follow',
      },
      violet: { label: 'Done', description: 'Status Done; pill tint follows' },
      'brand-sky': { label: 'Open', description: 'Status Open; pill tint follows' },
    },
  },
  typography: {
    title: 'Typography',
    fontFamily: {
      label: 'Font family',
      description: 'CSS font-family list, the first available font is used',
    },
    fontDisplay: {
      label: 'Heading font',
      description: 'Font family for headings; falls back to the body font',
    },
    fontWeight: {
      title: 'Font weights',
      normal: 'Normal',
      normalDesc: 'Body text, table cells, tab buttons, paging controls',
      medium: 'Medium',
      mediumDesc: 'Dialog titles, status badges, active paging button, question titles',
      semibold: 'Semibold',
      semiboldDesc: 'Card titles, section headings, field labels, active navigation items',
      bold: 'Bold',
      boldDesc: 'Landing page headlines and strong emphasis',
    },
    lineHeight: {
      title: 'Line heights',
      tight: 'Tight',
      tightDesc: 'Headings, card titles and subtitles',
      normal: 'Normal',
      normalDesc: 'Body text, dialog and help texts',
      relaxed: 'Relaxed',
      relaxedDesc: 'Landing page paragraphs',
    },
  },
  designTokens: {
    title: 'Design tokens',
    radius: {
      title: 'Corner radius',
      sm: 'Small (inputs, buttons, pills)',
      md: 'Medium (tables, badges, dropdown menus)',
      lg: 'Large (cards, dialogs, side navigation)',
      xl: 'Extra large (currently unused by the app)',
    },
    layout: { title: 'Layout' },
    topNav: { minHeight: 'Top navigation minimum height' },
    dropdown: { minWidth: 'Dropdown minimum width (currently unused by the app)' },
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The defaults with every text the host passed laid over them */
export function mergeBrandEditorLabels(
  overrides: BrandEditorLabelsInput | Record<string, unknown> | null | undefined,
): BrandEditorLabels {
  const merge = (base: Record<string, unknown>, extra: unknown): Record<string, unknown> => {
    if (!isPlainObject(extra)) {
      return base;
    }
    const result: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(extra)) {
      const current = result[key];
      if (isPlainObject(value)) {
        result[key] = merge(isPlainObject(current) ? current : {}, value);
      } else if (typeof value === 'string' && !isPlainObject(current)) {
        // A string never replaces a group of labels
        result[key] = value;
      }
    }
    return result;
  };
  return merge(
    BRAND_EDITOR_LABELS as unknown as Record<string, unknown>,
    overrides,
  ) as unknown as BrandEditorLabels;
}

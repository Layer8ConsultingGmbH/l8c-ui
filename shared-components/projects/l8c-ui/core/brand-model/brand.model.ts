/**
 * Brand configuration of an organization and the helpers that read and
 * apply it (ported from l8c-survey: models/brand.model.ts and
 * services/brand.service.ts).
 *
 * The values become CSS custom properties, so the token names here are the
 * CSS names without the leading dashes.
 */

/** Color tokens the brand editor exposes; each exists for dark and light */
export const BRAND_COLOR_TOKENS = [
  'primary',
  'primary-hover',
  'primary-dark',
  'on-primary',
  'bg',
  'surface',
  'surface-2',
  'surface-3',
  'text',
  'text-muted',
  'text-faint',
  'border',
  'border-strong',
  'success',
  'warning',
  'error',
  'info',
  'violet',
  'brand-sky',
] as const;

export type BrandColorToken = (typeof BRAND_COLOR_TOKENS)[number];

/** Editor sections of the color tokens */
export const BRAND_COLOR_GROUPS: { key: 'base' | 'status'; tokens: BrandColorToken[] }[] = [
  {
    key: 'base',
    tokens: [
      'primary',
      'primary-hover',
      'primary-dark',
      'on-primary',
      'bg',
      'surface',
      'surface-2',
      'surface-3',
      'text',
      'text-muted',
      'text-faint',
      'border',
      'border-strong',
    ],
  },
  { key: 'status', tokens: ['success', 'warning', 'error', 'info', 'violet', 'brand-sky'] },
];

/**
 * Tints derived from a hex color token: the low-alpha background and the
 * 40 percent border the status pills use. Set together with the token so a
 * changed status color keeps a matching pill.
 */
export const DERIVED_TINTS: Partial<Record<BrandColorToken, { bg: string; border?: string }>> = {
  success: { bg: '--success-bg', border: '--success-border' },
  warning: { bg: '--warning-bg', border: '--warning-border' },
  error: { bg: '--error-bg', border: '--error-border' },
  info: { bg: '--info-bg', border: '--info-border' },
  violet: { bg: '--status-done-bg' },
  'brand-sky': { bg: '--status-open-bg' },
};

export type BrandThemeColors = Partial<Record<BrandColorToken, string>>;

export type BrandTheme = 'dark' | 'light';

export const FONT_WEIGHT_KEYS = ['normal', 'medium', 'semibold', 'bold'] as const;
export type FontWeightKey = (typeof FONT_WEIGHT_KEYS)[number];

export const LINE_HEIGHT_KEYS = ['tight', 'normal', 'relaxed'] as const;
export type LineHeightKey = (typeof LINE_HEIGHT_KEYS)[number];

export const RADIUS_KEYS = ['sm', 'md', 'lg', 'xl'] as const;
export type RadiusKey = (typeof RADIUS_KEYS)[number];

export interface BrandTypography {
  fontFamily?: string;
  /** Heading font, falls back to fontFamily */
  fontDisplay?: string;
  fontWeight?: Partial<Record<FontWeightKey, number>>;
  lineHeight?: Partial<Record<LineHeightKey, number>>;
}

export interface BrandDesignTokens {
  radius?: Partial<Record<RadiusKey, string>>;
  topNav?: { minHeight?: string };
  dropdown?: { minWidth?: string };
}

export interface BrandLogos {
  dark?: string;
  light?: string;
}

export interface BrandConfig {
  name?: string;
  description?: string;
  logos?: BrandLogos;
  favicon?: string;
  colors?: { dark?: BrandThemeColors; light?: BrandThemeColors };
  typography?: BrandTypography;
  designTokens?: BrandDesignTokens;
}

/** One configuration in the editor's selection list */
export interface BrandConfigItem {
  id: number;
  name: string | null;
  isCurrent: boolean;
}

export const MAX_LOGO_BYTES = 200 * 1024;

export const LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export const FAVICON_MIME_TYPES = [
  'image/png',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

/** "#rgb" or "#rrggbb" to "r, g, b"; null for anything else */
export function hexToRgb(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) {
    return null;
  }
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** Stored values win over defaults, section by section */
export function mergeBrandConfig(
  defaults: BrandConfig = {},
  stored: BrandConfig = {},
): BrandConfig {
  return {
    name: stored.name ?? defaults.name,
    description: stored.description ?? defaults.description,
    logos: { ...defaults.logos, ...stored.logos },
    favicon: stored.favicon ?? defaults.favicon,
    colors: {
      dark: { ...defaults.colors?.dark, ...stored.colors?.dark },
      light: { ...defaults.colors?.light, ...stored.colors?.light },
    },
    typography: {
      fontFamily: stored.typography?.fontFamily ?? defaults.typography?.fontFamily,
      fontDisplay: stored.typography?.fontDisplay ?? defaults.typography?.fontDisplay,
      fontWeight: { ...defaults.typography?.fontWeight, ...stored.typography?.fontWeight },
      lineHeight: { ...defaults.typography?.lineHeight, ...stored.typography?.lineHeight },
    },
    designTokens: {
      radius: { ...defaults.designTokens?.radius, ...stored.designTokens?.radius },
      topNav: { ...defaults.designTokens?.topNav, ...stored.designTokens?.topNav },
      dropdown: { ...defaults.designTokens?.dropdown, ...stored.designTokens?.dropdown },
    },
  };
}

type Pruned<T> = { [K in keyof T]?: Exclude<T[K], null | undefined> };

/** Drops empty strings, null, undefined and non-finite numbers; undefined when nothing is left */
function prune<T extends object>(source: T | undefined): Pruned<T> | undefined {
  const result: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(source ?? {})) {
    const value = typeof raw === 'string' ? raw.trim() : raw;
    if (value === '' || value === null || value === undefined) {
      continue;
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      continue;
    }
    result[key] = value;
  }
  return Object.keys(result).length > 0 ? (result as Pruned<T>) : undefined;
}

/** The minimal config: only what has a value (what the editor saves) */
export function compactBrandConfig(source: BrandConfig = {}): BrandConfig {
  const config: BrandConfig = {};
  const name = (source.name ?? '').trim();
  if (name) {
    config.name = name;
  }
  const description = (source.description ?? '').trim();
  if (description) {
    config.description = description;
  }
  const logos = prune({ dark: source.logos?.dark, light: source.logos?.light });
  if (logos) {
    config.logos = logos;
  }
  if (source.favicon) {
    config.favicon = source.favicon;
  }
  const colors = prune({
    dark: prune(source.colors?.dark) as BrandThemeColors | undefined,
    light: prune(source.colors?.light) as BrandThemeColors | undefined,
  });
  if (colors) {
    config.colors = colors;
  }
  const typography = prune({
    fontFamily: source.typography?.fontFamily,
    fontDisplay: source.typography?.fontDisplay,
    fontWeight: prune(source.typography?.fontWeight),
    lineHeight: prune(source.typography?.lineHeight),
  });
  if (typography) {
    config.typography = typography;
  }
  const designTokens = prune({
    radius: prune(source.designTokens?.radius),
    topNav: prune(source.designTokens?.topNav),
    dropdown: prune(source.designTokens?.dropdown),
  });
  if (designTokens) {
    config.designTokens = designTokens;
  }
  return config;
}

/** Custom properties applyBrand() set on a root, so they can be removed again */
const applied = new WeakMap<HTMLElement, string[]>();

function defaultRoot(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}

/**
 * Reads the stylesheet values in use for both themes from `root`, so the
 * editor shows what is applied. Properties set by applyBrand() are lifted
 * while reading and put back afterwards. The light theme is the `light-theme`
 * class on the root.
 */
export function readBrandDefaults(root: HTMLElement | null = defaultRoot()): BrandConfig {
  if (!root || typeof getComputedStyle !== 'function') {
    return {};
  }
  const lifted = (applied.get(root) ?? []).map((name) => [name, root.style.getPropertyValue(name)]);
  for (const [name] of lifted) {
    root.style.removeProperty(name);
  }
  const wasLight = root.classList.contains('light-theme');
  try {
    const readTheme = (theme: BrandTheme) => {
      root.classList.toggle('light-theme', theme === 'light');
      const style = getComputedStyle(root);
      const colors: BrandThemeColors = {};
      for (const token of BRAND_COLOR_TOKENS) {
        const value = style.getPropertyValue(`--${token}`).trim();
        if (value) {
          colors[token] = value;
        }
      }
      return { style, colors };
    };
    const dark = readTheme('dark').colors;
    const { style, colors: light } = readTheme('light');
    // Development builds print long lists over several lines and custom
    // properties keep that; backends usually accept single blanks only
    const text = (name: string) =>
      style.getPropertyValue(name).replace(/\s+/g, ' ').trim() || undefined;
    const number = (name: string) => {
      const raw = text(name);
      const value = Number(raw);
      return raw !== undefined && Number.isFinite(value) ? value : undefined;
    };
    return {
      colors: { dark, light },
      typography: {
        fontFamily: text('--font-family'),
        fontDisplay: text('--font-display'),
        fontWeight: {
          normal: number('--font-weight-normal'),
          medium: number('--font-weight-medium'),
          semibold: number('--font-weight-semibold'),
          bold: number('--font-weight-bold'),
        },
        lineHeight: {
          tight: number('--line-height-tight'),
          normal: number('--line-height-normal'),
          relaxed: number('--line-height-relaxed'),
        },
      },
      designTokens: {
        radius: {
          sm: text('--radius-sm'),
          md: text('--radius-md'),
          lg: text('--radius-lg'),
          xl: text('--radius-xl'),
        },
        topNav: { minHeight: text('--top-nav-min-height') },
        dropdown: { minWidth: text('--dropdown-min-width') },
      },
    };
  } finally {
    root.classList.toggle('light-theme', wasLight);
    for (const [name, value] of lifted) {
      root.style.setProperty(name, value);
    }
  }
}

/**
 * Applies a brand config as CSS custom properties on `root` for `theme`;
 * `null` removes everything applied before. Status colors bring their pill
 * tint and border along, `primary` sets `--primary-rgb`, radius `lg` also
 * sets `--surface-radius`.
 */
export function applyBrand(
  config: BrandConfig | null,
  theme: BrandTheme = 'dark',
  root: HTMLElement | null = defaultRoot(),
): void {
  if (!root) {
    return;
  }
  for (const name of applied.get(root) ?? []) {
    root.style.removeProperty(name);
  }
  const names: string[] = [];
  applied.set(root, names);
  if (!config) {
    return;
  }

  const set = (name: string, value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    root.style.setProperty(name, String(value));
    names.push(name);
  };

  const colors = config.colors?.[theme];
  if (colors) {
    for (const token of BRAND_COLOR_TOKENS) {
      set(`--${token}`, colors[token]);
      // Status pills tint their background and border from the same hue
      const tint = DERIVED_TINTS[token];
      const rgb = hexToRgb(colors[token]);
      if (tint && rgb) {
        set(tint.bg, `rgba(${rgb}, 0.14)`);
        if (tint.border) {
          set(tint.border, `rgba(${rgb}, 0.4)`);
        }
      }
    }
    // rgba() focus rings and hover tints derive from the primary channels
    const rgb = hexToRgb(colors.primary);
    if (rgb) {
      set('--primary-rgb', rgb);
    }
  }

  const typography = config.typography;
  if (typography) {
    set('--font-family', typography.fontFamily);
    set('--font-display', typography.fontDisplay);
    for (const [key, value] of Object.entries(typography.fontWeight ?? {})) {
      set(`--font-weight-${key}`, value);
    }
    for (const [key, value] of Object.entries(typography.lineHeight ?? {})) {
      set(`--line-height-${key}`, value);
    }
  }

  const tokens = config.designTokens;
  if (tokens) {
    for (const [key, value] of Object.entries(tokens.radius ?? {})) {
      set(`--radius-${key}`, value);
    }
    // Cards and panels use the canonical surface radius, which follows lg
    set('--surface-radius', tokens.radius?.lg);
    set('--top-nav-min-height', tokens.topNav?.minHeight);
    set('--dropdown-min-width', tokens.dropdown?.minWidth);
  }
}

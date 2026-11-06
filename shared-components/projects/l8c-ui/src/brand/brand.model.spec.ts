import {
  applyBrand,
  compactBrandConfig,
  hexToRgb,
  mergeBrandConfig,
  readBrandDefaults,
} from './brand.model';
import { BRAND_EDITOR_LABELS, mergeBrandEditorLabels } from './brand-labels';

describe('brand model helpers', () => {
  function rootProperty(name: string): string {
    return document.documentElement.style.getPropertyValue(name);
  }

  afterEach(() => {
    applyBrand(null);
  });

  it('converts hex colors to rgb channels', () => {
    expect(hexToRgb('#2a7ab8')).toBe('42, 122, 184');
    expect(hexToRgb('#fff')).toBe('255, 255, 255');
    expect(hexToRgb('rgba(1, 2, 3, 0.5)')).toBeNull();
    expect(hexToRgb(undefined)).toBeNull();
  });

  it('lets stored values win over defaults section by section', () => {
    const merged = mergeBrandConfig(
      {
        colors: { dark: { primary: '#111111', bg: '#000000' } },
        typography: { fontFamily: 'Inter', fontWeight: { normal: 400, bold: 700 } },
        designTokens: { radius: { sm: '4px' } },
      },
      {
        name: 'Corporate',
        colors: { dark: { primary: '#ff0000' } },
        typography: { fontWeight: { bold: 800 } },
      },
    );

    expect(merged.name).toBe('Corporate');
    expect(merged.colors?.dark).toEqual({ primary: '#ff0000', bg: '#000000' });
    expect(merged.typography).toEqual({
      fontFamily: 'Inter',
      fontDisplay: undefined,
      fontWeight: { normal: 400, bold: 800 },
      lineHeight: {},
    });
    expect(merged.designTokens?.radius).toEqual({ sm: '4px' });
  });

  it('keeps only filled values when compacting', () => {
    expect(
      compactBrandConfig({
        name: '  Corporate ',
        description: '   ',
        logos: { dark: '', light: undefined },
        colors: { dark: { primary: ' #ff0000 ', bg: '' }, light: {} },
        typography: { fontFamily: '', fontWeight: { normal: Number.NaN, bold: 700 } },
        designTokens: { radius: { sm: '' }, topNav: { minHeight: '64px' } },
      }),
    ).toEqual({
      name: 'Corporate',
      colors: { dark: { primary: '#ff0000' } },
      typography: { fontWeight: { bold: 700 } },
      designTokens: { topNav: { minHeight: '64px' } },
    });
    expect(compactBrandConfig({})).toEqual({});
  });

  it('applies the colors of the theme with their derived tints and removes them again', () => {
    applyBrand(
      {
        colors: {
          dark: { primary: '#ff0000', success: '#00aa00', violet: 'rgb(1, 2, 3)' },
          light: { primary: '#00ff00' },
        },
        typography: { fontFamily: "'Inter', sans-serif", fontWeight: { bold: 800 } },
        designTokens: { radius: { lg: '20px' }, topNav: { minHeight: '80px' } },
      },
      'dark',
    );

    expect(rootProperty('--primary')).toBe('#ff0000');
    expect(rootProperty('--primary-rgb')).toBe('255, 0, 0');
    expect(rootProperty('--success-bg')).toBe('rgba(0, 170, 0, 0.14)');
    expect(rootProperty('--success-border')).toBe('rgba(0, 170, 0, 0.4)');
    // Only hex colors can be split into channels; the stylesheet tint stays
    expect(rootProperty('--violet')).toBe('rgb(1, 2, 3)');
    expect(rootProperty('--status-done-bg')).toBe('');
    expect(rootProperty('--font-family')).toBe("'Inter', sans-serif");
    expect(rootProperty('--font-weight-bold')).toBe('800');
    expect(rootProperty('--radius-lg')).toBe('20px');
    expect(rootProperty('--surface-radius')).toBe('20px');
    expect(rootProperty('--top-nav-min-height')).toBe('80px');

    applyBrand({ colors: { light: { primary: '#00ff00' } } }, 'light');
    expect(rootProperty('--primary')).toBe('#00ff00');
    expect(rootProperty('--success-bg')).toBe('');
    expect(rootProperty('--radius-lg')).toBe('');

    applyBrand(null);
    expect(rootProperty('--primary')).toBe('');
  });

  it('reads the defaults as one line and lifts applied values while reading', () => {
    applyBrand({ typography: { fontFamily: 'Applied' } });
    const computed: Record<string, string> = {
      '--font-family': '\n    "Inter",\n    system-ui,\n    sans-serif',
      '--font-weight-bold': '700',
    };
    const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: (name: string) =>
            // While reading, the applied inline value must be gone
            name === '--font-family' && rootProperty('--font-family')
              ? 'LEAKED'
              : (computed[name] ?? ''),
        }) as CSSStyleDeclaration,
    );
    try {
      const defaults = readBrandDefaults();

      expect(defaults.typography?.fontFamily).toBe('"Inter", system-ui, sans-serif');
      expect(defaults.typography?.fontWeight?.bold).toBe(700);
      expect(defaults.typography?.fontWeight?.normal).toBeUndefined();
      // The applied value is back afterwards
      expect(rootProperty('--font-family')).toBe('Applied');
    } finally {
      spy.mockRestore();
    }
  });

  it('lays passed labels over the English defaults', () => {
    const labels = mergeBrandEditorLabels({
      title: 'Marke',
      colors: { token: { primary: { label: 'Primär', description: 'Knöpfe' } } },
    });

    expect(labels.title).toBe('Marke');
    expect(labels.actions.save).toBe(BRAND_EDITOR_LABELS.actions.save);
    expect(labels.colors.token['primary'].label).toBe('Primär');
    expect(labels.colors.token['bg']).toEqual(BRAND_EDITOR_LABELS.colors.token['bg']);
    expect(mergeBrandEditorLabels(null)).toEqual(BRAND_EDITOR_LABELS);
  });
});

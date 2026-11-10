import { BRAND_EDITOR_LABELS, mergeBrandEditorLabels } from './brand-labels';

describe('mergeBrandEditorLabels', () => {
  it('returns the English defaults without overrides', () => {
    expect(mergeBrandEditorLabels(null)).toEqual(BRAND_EDITOR_LABELS);
    expect(mergeBrandEditorLabels(undefined)).toEqual(BRAND_EDITOR_LABELS);
    expect(mergeBrandEditorLabels({})).toEqual(BRAND_EDITOR_LABELS);
  });

  it('does not change the defaults object', () => {
    const before = JSON.stringify(BRAND_EDITOR_LABELS);
    mergeBrandEditorLabels({ title: 'Brand', configs: { new: 'Create' } });
    expect(JSON.stringify(BRAND_EDITOR_LABELS)).toBe(before);
  });

  it('lays a partial override over the defaults', () => {
    const labels = mergeBrandEditorLabels({ title: 'Brand', actions: { save: 'Store' } });

    expect(labels.title).toBe('Brand');
    expect(labels.intro).toBe(BRAND_EDITOR_LABELS.intro);
    expect(labels.actions.save).toBe('Store');
    expect(labels.actions.reset).toBe(BRAND_EDITOR_LABELS.actions.reset);
  });

  it('merges nested objects such as color tokens key by key', () => {
    const labels = mergeBrandEditorLabels({
      colors: { token: { primary: { label: 'Primary color' } } },
      typography: { fontWeight: { bold: 'Heavy' } },
    });

    expect(labels.colors.token['primary'].label).toBe('Primary color');
    expect(labels.colors.token['primary'].description).toBe(
      BRAND_EDITOR_LABELS.colors.token['primary'].description,
    );
    expect(labels.colors.token['bg']).toEqual(BRAND_EDITOR_LABELS.colors.token['bg']);
    expect(labels.typography.fontWeight['bold']).toBe('Heavy');
    expect(labels.typography.fontWeight['normal']).toBe('Normal');
  });

  it('ignores undefined, non-string and non-object values', () => {
    const labels = mergeBrandEditorLabels({
      title: undefined,
      intro: 42,
      actions: 'nope',
      configs: { new: null, newName: ['x'] },
    } as Record<string, unknown>);

    expect(labels.title).toBe(BRAND_EDITOR_LABELS.title);
    expect(labels.intro).toBe(BRAND_EDITOR_LABELS.intro);
    expect(labels.actions).toEqual(BRAND_EDITOR_LABELS.actions);
    expect(labels.configs.new).toBe('New');
    expect(labels.configs.newName).toBe('New configuration');
  });

  it('keeps unknown keys a host passes along without breaking known ones', () => {
    const labels = mergeBrandEditorLabels({ extra: 'x', discard: { confirm: 'Throw away' } });

    expect(labels.discard.confirm).toBe('Throw away');
    expect(labels.discard.title).toBe(BRAND_EDITOR_LABELS.discard.title);
  });
});

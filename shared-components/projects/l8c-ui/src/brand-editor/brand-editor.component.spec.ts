import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { L8cBrandEditorComponent } from './brand-editor.component';
import { BrandConfig, BrandConfigItem } from '../brand/brand.model';

const DEFAULTS: BrandConfig = {
  colors: {
    dark: { primary: '#2a7ab8', bg: '#0b1220' },
    light: { primary: '#2a7ab8', bg: '#f8f9fc' },
  },
  typography: { fontFamily: "'Inter', sans-serif", fontWeight: { normal: 400, bold: 700 } },
  designTokens: { radius: { sm: '6px', lg: '12px' }, topNav: { minHeight: '64px' } },
};

const STORED: BrandConfig = {
  name: 'Corporate',
  colors: { dark: { primary: '#ff0000' } },
  typography: { fontFamily: "'Roboto', sans-serif" },
};

const ACTIVE: BrandConfigItem = { id: 1, name: 'Corporate', isCurrent: true };
const SPRING: BrandConfigItem = { id: 2, name: 'Spring', isCurrent: false };

@Component({
  imports: [L8cBrandEditorComponent],
  template: `
    <l8c-brand-editor
      [configs]="configs()"
      [selectedId]="selectedId()"
      [config]="config()"
      [draft]="draft"
      [defaults]="defaults"
      [activeTheme]="'light'"
      [saving]="saving()"
      [labels]="labels"
      [cancelLabel]="'Go back'"
      [deleteLabel]="'Delete'"
      (selected)="events.push(['selected', $event])"
      (created)="events.push(['created', $event])"
      (saved)="events.push(['saved', $event])"
      (activated)="events.push(['activated', $event])"
      (deleted)="events.push(['deleted', $event])"
      (preview)="previews.push($event)"
    />
  `,
})
class HostComponent {
  configs = signal<BrandConfigItem[]>([ACTIVE, SPRING]);
  selectedId = signal<number | null>(null);
  config = signal<BrandConfig | null>(null);
  draft: BrandConfig | null = null;
  defaults = DEFAULTS;
  saving = signal(false);
  labels: Record<string, unknown> = { configs: { newName: 'Untitled configuration' } };
  events: [string, unknown][] = [];
  previews: (BrandConfig | null)[] = [];

  /** What a host does after the editor asked for a selection */
  open(id: number | null, config: BrandConfig | null): void {
    this.selectedId.set(id);
    this.config.set(config);
  }
}

interface EditorApi {
  form: FormGroup;
  selectionControl: FormControl<string>;
  selectionOptions: () => { value: string; label: string }[];
  currentDraft: () => BrandConfig;
  dirty: () => boolean;
  canSave: () => boolean;
  canActivate: () => boolean;
  canDelete: () => boolean;
  confirmDialog?: { open: (title: string, message: string, label?: string) => void };
  newConfig: () => void;
  deleteSelected: () => void;
  activateSelected: () => void;
  onConfirmed: () => void;
  onCancelled: () => void;
  reset: () => void;
  save: () => void;
}

describe('L8cBrandEditorComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let api: EditorApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // The template-facing API is protected; tests reach it through the instance
    api = fixture.debugElement.query((el) => el.name === 'l8c-brand-editor')
      .componentInstance as EditorApi;
  });

  function control(path: string) {
    const ctrl = api.form.get(path);
    if (!ctrl) {
      throw new Error(`No control at ${path}`);
    }
    return ctrl;
  }

  function pick(value: string): void {
    api.selectionControl.setValue(value);
  }

  /** Lets the host answer a `selected` event the way a real host does */
  function openFromHost(id: number | null, config: BrandConfig | null = STORED): void {
    host.open(id, config);
    fixture.detectChanges();
  }

  it('lists the configurations with the active one marked and starts with nothing selected', () => {
    expect(api.selectionOptions().map((o) => o.value)).toEqual(['', '1', '2']);
    expect(api.selectionOptions()[1].label).toBe('Corporate (active)');
    expect(api.selectionOptions()[2].label).toBe('Spring');
    expect(api.canSave()).toBe(false);
    expect(api.canDelete()).toBe(false);
    // Nothing selected: the app keeps showing the active branding
    expect(host.previews).toEqual([null]);
  });

  it('reports a pick as selected and shows the config the host passes back', () => {
    pick('1');
    expect(host.events).toEqual([['selected', 1]]);

    openFromHost(1);

    // Stored value wins, everything else shows the defaults
    expect(control('name').value).toBe('Corporate');
    expect(control('colors.dark.primary').value).toBe('#ff0000');
    expect(control('colors.dark.bg').value).toBe('#0b1220');
    expect(api.dirty()).toBe(false);
    expect(host.previews.at(-1)).toEqual(api.currentDraft());
    // Already active
    expect(api.canActivate()).toBe(false);
    expect(api.canDelete()).toBe(true);
  });

  it('previews every change and allows saving the compact draft', () => {
    openFromHost(2);
    control('colors.light.bg').setValue('#123456');

    expect(api.currentDraft().colors?.light?.bg).toBe('#123456');
    expect(host.previews.at(-1)).toEqual(api.currentDraft());
    expect(api.dirty()).toBe(true);
    expect(api.canSave()).toBe(true);
    // Activating applies the stored state, so save first
    expect(api.canActivate()).toBe(false);

    api.save();
    expect(host.events.at(-1)).toEqual(['saved', api.currentDraft()]);
    // Blank fields are left out of the draft
    control('colors.dark.bg').setValue('');
    expect(api.currentDraft().colors?.dark?.bg).toBeUndefined();
  });

  it('requires a name to save', () => {
    openFromHost(1);
    control('name').setValue('   ');

    expect(api.dirty()).toBe(true);
    expect(api.canSave()).toBe(false);
  });

  it('is clean again once the host passes the saved config back', () => {
    openFromHost(1);
    control('colors.dark.primary').setValue('#000000');
    expect(api.dirty()).toBe(true);

    openFromHost(1, api.currentDraft());

    expect(api.dirty()).toBe(false);
    expect(control('colors.dark.primary').value).toBe('#000000');
  });

  it('discards the draft on reset', () => {
    openFromHost(1);
    control('colors.dark.primary').setValue('#000000');

    api.reset();

    expect(control('colors.dark.primary').value).toBe('#ff0000');
    expect(api.dirty()).toBe(false);
    expect(host.previews.at(-1)).toEqual(api.currentDraft());
  });

  it('resumes an unsaved draft the host hands in', () => {
    host.draft = { ...STORED, colors: { dark: { primary: '#000000' } } };
    openFromHost(1);

    expect(control('colors.dark.primary').value).toBe('#000000');
    expect(api.dirty()).toBe(true);
  });

  it('asks before leaving unsaved changes and reverts the dropdown on cancel', () => {
    openFromHost(1);
    control('colors.dark.primary').setValue('#000000');
    const open = vi.fn();
    api.confirmDialog = { open };

    pick('2');
    expect(open).toHaveBeenCalledWith(
      'Discard unsaved changes?',
      'Your changes to "Corporate" will be lost.',
      'Discard',
    );
    expect(host.events).toEqual([]);

    api.onCancelled();
    expect(api.selectionControl.value).toBe('1');
    expect(api.dirty()).toBe(true);

    pick('2');
    api.onConfirmed();
    expect(host.events).toEqual([['selected', 2]]);
  });

  it('asks for a new configuration with the default name from the labels', () => {
    api.newConfig();

    expect(host.events).toEqual([['created', 'Untitled configuration']]);
  });

  it('activates a saved, inactive configuration', () => {
    openFromHost(2);

    expect(api.canActivate()).toBe(true);
    api.activateSelected();

    expect(host.events.at(-1)).toEqual(['activated', 2]);
  });

  it('deletes after confirmation, with the stronger message for the active configuration', () => {
    openFromHost(1);
    const open = vi.fn();
    api.confirmDialog = { open };

    api.deleteSelected();
    expect(open).toHaveBeenCalledWith(
      'Delete configuration',
      'Delete "Corporate"? It is the active branding; everyone will see the default branding afterwards.',
      'Delete',
    );
    expect(host.events.filter(([name]) => name === 'deleted')).toEqual([]);

    api.onConfirmed();
    expect(host.events.at(-1)).toEqual(['deleted', 1]);
  });

  it('disables the actions while saving', () => {
    openFromHost(2);
    control('name').setValue('Spring 2');
    expect(api.canSave()).toBe(true);

    host.saving.set(true);
    fixture.detectChanges();

    expect(api.canSave()).toBe(false);
    expect(api.canDelete()).toBe(false);
  });

  it('renders the color fields with their theme in the accessible name', () => {
    openFromHost(1);

    const names = Array.from(
      fixture.nativeElement.querySelectorAll('l8c-color-input input[type="text"]'),
    ).map((input) => (input as HTMLInputElement).getAttribute('aria-label'));
    expect(names).toContain('Primary (Dark theme)');
    expect(names).toContain('Primary (Light theme)');
    expect(names.length).toBe(38);
  });

  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    // Angular warns about [disabled] on reactive controls; only the library's warnings count
    const libWarnings = () =>
      warn.mock.calls.filter((call: unknown[]) => String(call[0]).startsWith('[@l8c/ui]'));

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('offers no configurations when configs is no array', () => {
      host.configs.set('Corporate' as unknown as BrandConfigItem[]);
      fixture.detectChanges();

      expect(api.selectionOptions().map((o) => o.value)).toEqual(['']);
      expect(libWarnings().length).toBe(1);
    });

    it('reads a numeric selectedId string and treats a non-numeric one as no selection', () => {
      host.selectedId.set('1' as unknown as number);
      host.config.set(STORED);
      fixture.detectChanges();
      expect(control('name').value).toBe('Corporate');
      expect(api.canDelete()).toBe(true);
      expect(libWarnings()).toEqual([]);

      host.selectedId.set('first' as unknown as number);
      fixture.detectChanges();
      expect(api.canDelete()).toBe(false);
      expect(libWarnings().length).toBe(1);
    });

    it('ignores a config that is no object and keeps the defaults', () => {
      host.selectedId.set(2);
      host.config.set('red' as unknown as BrandConfig);
      fixture.detectChanges();

      expect(control('colors.dark.primary').value).toBe('#2a7ab8');
      expect(libWarnings().length).toBe(1);
    });

    it('reads saving as a boolean attribute and warns on other text', () => {
      host.selectedId.set(1);
      host.config.set(STORED);
      host.saving.set('' as unknown as boolean);
      fixture.detectChanges();
      expect(api.canDelete()).toBe(false);
      expect(libWarnings()).toEqual([]);

      host.saving.set('maybe' as unknown as boolean);
      fixture.detectChanges();
      expect(api.canDelete()).toBe(true);
      expect(libWarnings().length).toBe(1);
    });
  });
});

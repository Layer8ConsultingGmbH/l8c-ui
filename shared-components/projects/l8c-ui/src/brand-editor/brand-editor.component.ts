import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { L8cButtonComponent } from '../button/button.component';
import { L8cCardComponent } from '../card/card.component';
import { L8cColorInputComponent } from '../color-input/color-input.component';
import { L8cConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { L8cFileInputComponent } from '../file-input/file-input.component';
import { L8cInputComponent } from '../input/input.component';
import { L8cNumberInputComponent } from '../number-input/number-input.component';
import { L8cSelectComponent, SelectOption } from '../select/select.component';
import {
  BRAND_COLOR_GROUPS,
  BRAND_COLOR_TOKENS,
  BrandColorToken,
  BrandConfig,
  BrandConfigItem,
  BrandTheme,
  FAVICON_MIME_TYPES,
  FONT_WEIGHT_KEYS,
  FontWeightKey,
  LINE_HEIGHT_KEYS,
  LOGO_MIME_TYPES,
  LineHeightKey,
  MAX_LOGO_BYTES,
  RADIUS_KEYS,
  RadiusKey,
  compactBrandConfig,
  mergeBrandConfig,
} from '../brand/brand.model';
import { BrandEditorLabelsInput, mergeBrandEditorLabels } from '../brand/brand-labels';
import {
  BooleanInput,
  NumberInput,
  StringInput,
  arrayInput,
  booleanInput,
  oneOf,
  optionalNumberInput,
  stringInput,
  warnInvalidInput,
} from '../shared/input-validation';

/** Image fields of the brand: the two theme logos and the favicon */
export type BrandImageSlot = BrandTheme | 'favicon';

type ColorGroup = FormGroup<Record<BrandColorToken, FormControl<string>>>;
type NumberGroup<K extends string> = FormGroup<Record<K, FormControl<number | null>>>;
type TextGroup<K extends string> = FormGroup<Record<K, FormControl<string>>>;

function textControl(): FormControl<string> {
  return new FormControl('', { nonNullable: true });
}

function numberControl(): FormControl<number | null> {
  return new FormControl<number | null>(null);
}

function colorGroup(): ColorGroup {
  const controls = {} as Record<BrandColorToken, FormControl<string>>;
  for (const token of BRAND_COLOR_TOKENS) {
    controls[token] = textControl();
  }
  return new FormGroup(controls);
}

function numberGroup<K extends string>(keys: readonly K[]): NumberGroup<K> {
  const controls = {} as Record<K, FormControl<number | null>>;
  for (const key of keys) {
    controls[key] = numberControl();
  }
  return new FormGroup(controls);
}

function textGroup<K extends string>(keys: readonly K[]): TextGroup<K> {
  const controls = {} as Record<K, FormControl<string>>;
  for (const key of keys) {
    controls[key] = textControl();
  }
  return new FormGroup(controls);
}

/** `{{name}}` in a label becomes the configuration name */
function fill(text: string, name: string | null | undefined): string {
  return text.replace(/\{\{\s*name\s*\}\}/g, name ?? '');
}

const SELECTOR = 'l8c-brand-editor';
const BRAND_THEMES = ['dark', 'light'] as const satisfies readonly BrandTheme[];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A brand config object; `null`/`undefined` and anything that is no object read as `fallback` */
function configInput<F extends BrandConfig | null>(
  name: string,
  fallback: F,
): (value: BrandConfig | null | undefined) => BrandConfig | F {
  return (value) => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (!isPlainObject(value)) {
      warnInvalidInput(SELECTOR, name, value, 'expected a brand config object, using the default');
      return fallback;
    }
    return value;
  };
}

/** The labels object; anything that is no object reads as null (English defaults) */
function labelsInput(
  value: BrandEditorLabelsInput | Record<string, unknown> | null | undefined,
): BrandEditorLabelsInput | Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (!isPlainObject(value)) {
    warnInvalidInput(SELECTOR, 'labels', value, 'expected a labels object, using the defaults');
    return null;
  }
  return value;
}

/**
 * Organization branding in one page: configurations (select, new, activate,
 * delete), name and description, logos and favicon, theme colors for dark
 * and light, typography and design tokens.
 *
 * The host owns the data. The editor keeps only the draft (the stored
 * `config` on top of `defaults`) and reports intents: `selected`, `created`,
 * `saved`, `activated`, `deleted`. Load, store and toast in the host, then
 * pass the new `configs` / `config`. `preview` fires with every change of
 * the draft (null while nothing is selected) - pass it to `applyBrand()`.
 *
 * All texts are finished strings: `labels` takes the l8c-survey
 * `brandEditor` translation object (partial is fine, English defaults are
 * built in).
 */
@Component({
  selector: 'l8c-brand-editor',
  imports: [
    ReactiveFormsModule,
    L8cButtonComponent,
    L8cCardComponent,
    L8cColorInputComponent,
    L8cConfirmDialogComponent,
    L8cFileInputComponent,
    L8cInputComponent,
    L8cNumberInputComponent,
    L8cSelectComponent,
  ],
  host: { class: 'brand-editor' },
  templateUrl: './brand-editor.component.html',
  styleUrls: ['./brand-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cBrandEditorComponent {
  @ViewChild(L8cConfirmDialogComponent) confirmDialog?: L8cConfirmDialogComponent;

  private destroyRef = inject(DestroyRef);

  /** The configurations on offer */
  configs = input<BrandConfigItem[], readonly BrandConfigItem[] | null | undefined>([], {
    transform: arrayInput(SELECTOR, 'configs'),
  });
  /** Open configuration, null for none (the active branding applies) */
  selectedId = input<number | null, NumberInput>(null, {
    transform: (value) =>
      optionalNumberInput(SELECTOR, 'selectedId', { integer: true })(value) ?? null,
  });
  /** Stored config of the open configuration */
  config = input<BrandConfig | null, BrandConfig | null | undefined>(null, {
    transform: configInput('config', null),
  });
  /**
   * An unsaved draft of the open configuration to resume (e.g. the host's
   * preview after navigating back); read whenever the selection changes
   */
  draft = input<BrandConfig | null, BrandConfig | null | undefined>(null, {
    transform: configInput('draft', null),
  });
  /** Values in use when a field is empty, usually readBrandDefaults() */
  defaults = input<BrandConfig, BrandConfig | null | undefined>(
    {},
    {
      transform: configInput('defaults', {}),
    },
  );
  /** Marks the column of the theme the app shows */
  activeTheme = input<BrandTheme, BrandTheme | null | undefined>('dark', {
    transform: oneOf(SELECTOR, 'activeTheme', BRAND_THEMES, 'dark'),
  });
  /** Disables the actions while a request runs */
  saving = input<boolean, BooleanInput>(false, { transform: booleanInput(SELECTOR, 'saving') });
  /** Texts, shape of the l8c-survey `brandEditor` translation object */
  labels = input<
    BrandEditorLabelsInput | Record<string, unknown> | null,
    BrandEditorLabelsInput | Record<string, unknown> | null | undefined
  >(null, { transform: labelsInput });
  cancelLabel = input<string, StringInput>('Cancel', {
    transform: stringInput(SELECTOR, 'cancelLabel', 'Cancel'),
  });
  deleteLabel = input<string, StringInput>('Delete', {
    transform: stringInput(SELECTOR, 'deleteLabel', 'Delete'),
  });

  /** After the discard check: the configuration to open, null for none */
  selected = output<number | null>();
  /** After the discard check, with the default name for the new configuration */
  created = output<string>();
  /** The compact draft (only filled values) */
  saved = output<BrandConfig>();
  activated = output<number>();
  /** After the delete confirmation */
  deleted = output<number>();
  /** Every change of the draft; null while nothing is selected */
  preview = output<BrandConfig | null>();

  protected readonly L = computed(() => mergeBrandEditorLabels(this.labels()));
  protected readonly colorGroups = BRAND_COLOR_GROUPS;
  protected readonly themes: BrandTheme[] = ['dark', 'light'];
  protected readonly fontWeightKeys = FONT_WEIGHT_KEYS;
  protected readonly lineHeightKeys = LINE_HEIGHT_KEYS;
  protected readonly radiusKeys = RADIUS_KEYS;
  protected readonly imageSlots: BrandImageSlot[] = ['dark', 'light', 'favicon'];

  protected readonly form = new FormGroup({
    name: textControl(),
    description: textControl(),
    colors: new FormGroup({ dark: colorGroup(), light: colorGroup() }),
    typography: new FormGroup({
      fontFamily: textControl(),
      fontDisplay: textControl(),
      fontWeight: numberGroup(FONT_WEIGHT_KEYS),
      lineHeight: numberGroup(LINE_HEIGHT_KEYS),
    }),
    designTokens: new FormGroup({
      radius: textGroup(RADIUS_KEYS),
      topNav: textGroup(['minHeight'] as const),
      dropdown: textGroup(['minWidth'] as const),
    }),
  });
  protected readonly selectionControl = new FormControl('', { nonNullable: true });

  /** Logos and favicon are not form controls; they come from file inputs */
  protected readonly images = signal<Partial<Record<BrandImageSlot, string>>>({});
  /** Config the form currently describes; feeds the live preview */
  protected readonly currentDraft = signal<BrandConfig>({});
  /** Values the form started from (the stored configuration on top of the defaults) */
  private readonly baseline = signal<BrandConfig>({});
  protected readonly dirty = computed(
    () => JSON.stringify(this.currentDraft()) !== JSON.stringify(this.baseline()),
  );
  protected readonly imageErrors = signal<Partial<Record<BrandImageSlot, string>>>({});

  protected readonly hasSelection = computed(() => this.selectedId() !== null);
  protected readonly selectedItem = computed<BrandConfigItem | null>(() => {
    const id = this.selectedId();
    return id === null ? null : (this.configs().find((item) => item.id === id) ?? null);
  });
  protected readonly selectionOptions = computed<SelectOption[]>(() => {
    const labels = this.L().selection;
    return [
      { value: '', label: labels.none },
      ...this.configs().map((item) => ({
        value: String(item.id),
        label: item.isCurrent ? `${item.name ?? ''} (${labels.active})` : (item.name ?? ''),
      })),
    ];
  });
  protected readonly canSave = computed(
    () => this.hasSelection() && this.dirty() && !this.saving() && !!this.currentDraft().name,
  );
  protected readonly canActivate = computed(() => {
    const item = this.selectedItem();
    return item !== null && !item.isCurrent && !this.dirty() && !this.saving();
  });
  protected readonly canDelete = computed(() => this.hasSelection() && !this.saving());

  // What the confirm dialog will run when confirmed or cancelled
  private pendingConfirm: (() => void) | null = null;
  private pendingCancel: (() => void) | null = null;

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.draftChanged();
    });
    this.selectionControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.onSelectionChange(value ? Number(value) : null));
    // A new selection or a new stored config replaces form and baseline
    effect(() => {
      const id = this.selectedId();
      const config = this.config();
      untracked(() => this.load(id, config));
    });
  }

  private load(id: number | null, config: BrandConfig | null): void {
    this.syncSelectionControl();
    this.imageErrors.set({});
    if (id === null) {
      this.baseline.set(this.fillForm({}));
      this.currentDraft.set(this.baseline());
      this.preview.emit(null);
      return;
    }
    this.baseline.set(this.fillForm(config ?? {}));
    const draft = this.draft();
    this.currentDraft.set(draft ? this.fillForm(draft) : this.baseline());
    this.preview.emit(this.currentDraft());
  }

  private onSelectionChange(target: number | null): void {
    if (target === this.selectedId()) {
      return;
    }
    this.withDiscardCheck(
      () => this.selected.emit(target),
      // Cancelled: the dropdown goes back to what is still open
      () => this.syncSelectionControl(),
    );
  }

  private syncSelectionControl(): void {
    const id = this.selectedId();
    this.selectionControl.setValue(id === null ? '' : String(id), { emitEvent: false });
  }

  private withDiscardCheck(action: () => void, onCancel?: () => void): void {
    if (!this.dirty()) {
      action();
      return;
    }
    const labels = this.L().discard;
    this.pendingConfirm = action;
    this.pendingCancel = onCancel ?? null;
    this.confirmDialog?.open(
      labels.title,
      fill(labels.message, this.selectedItem()?.name),
      labels.confirm,
    );
  }

  protected onConfirmed(): void {
    const action = this.pendingConfirm;
    this.pendingConfirm = null;
    this.pendingCancel = null;
    action?.();
  }

  protected onCancelled(): void {
    const onCancel = this.pendingCancel;
    this.pendingConfirm = null;
    this.pendingCancel = null;
    onCancel?.();
  }

  private fillForm(source: BrandConfig): BrandConfig {
    const merged = mergeBrandConfig(this.defaults(), source);
    const colors = (theme: BrandTheme) => {
      const values = {} as Record<BrandColorToken, string>;
      for (const token of BRAND_COLOR_TOKENS) {
        values[token] = merged.colors?.[theme]?.[token] ?? '';
      }
      return values;
    };
    const numbers = <K extends string>(keys: readonly K[], source?: Partial<Record<K, number>>) => {
      const values = {} as Record<K, number | null>;
      for (const key of keys) {
        values[key] = source?.[key] ?? null;
      }
      return values;
    };
    const texts = <K extends string>(keys: readonly K[], source?: Partial<Record<K, string>>) => {
      const values = {} as Record<K, string>;
      for (const key of keys) {
        values[key] = source?.[key] ?? '';
      }
      return values;
    };
    this.form.setValue(
      {
        name: merged.name ?? '',
        description: merged.description ?? '',
        colors: { dark: colors('dark'), light: colors('light') },
        typography: {
          fontFamily: merged.typography?.fontFamily ?? '',
          fontDisplay: merged.typography?.fontDisplay ?? '',
          fontWeight: numbers(FONT_WEIGHT_KEYS, merged.typography?.fontWeight),
          lineHeight: numbers(LINE_HEIGHT_KEYS, merged.typography?.lineHeight),
        },
        designTokens: {
          radius: texts(RADIUS_KEYS, merged.designTokens?.radius),
          topNav: texts(['minHeight'] as const, merged.designTokens?.topNav),
          dropdown: texts(['minWidth'] as const, merged.designTokens?.dropdown),
        },
      },
      { emitEvent: false },
    );
    this.images.set({
      dark: source.logos?.dark,
      light: source.logos?.light,
      favicon: source.favicon,
    });
    return this.toConfig();
  }

  private toConfig(): BrandConfig {
    const value = this.form.getRawValue();
    const images = this.images();
    return compactBrandConfig({
      name: value.name,
      description: value.description,
      logos: { dark: images.dark, light: images.light },
      favicon: images.favicon,
      colors: value.colors,
      typography: {
        fontFamily: value.typography.fontFamily,
        fontDisplay: value.typography.fontDisplay,
        fontWeight: value.typography.fontWeight as Partial<Record<FontWeightKey, number>>,
        lineHeight: value.typography.lineHeight as Partial<Record<LineHeightKey, number>>,
      },
      designTokens: value.designTokens,
    });
  }

  private draftChanged(): void {
    if (!this.hasSelection()) {
      return;
    }
    this.currentDraft.set(this.toConfig());
    this.preview.emit(this.currentDraft());
  }

  // ---- colors ----

  protected colorGroup(theme: BrandTheme): ColorGroup {
    return this.form.controls.colors.controls[theme];
  }

  protected colorLabel(theme: BrandTheme, token: BrandColorToken): string {
    const labels = this.L().colors;
    return `${labels.token[token]?.label ?? token} (${labels[theme]})`;
  }

  // ---- logos and favicon ----

  protected image(slot: BrandImageSlot): string | undefined {
    return this.images()[slot];
  }

  protected accept(slot: BrandImageSlot): string {
    return (slot === 'favicon' ? FAVICON_MIME_TYPES : LOGO_MIME_TYPES).join(',');
  }

  protected onImageChosen(slot: BrandImageSlot, files: File[]): void {
    const file = files[0];
    if (!file) {
      return;
    }
    const allowed = slot === 'favicon' ? FAVICON_MIME_TYPES : LOGO_MIME_TYPES;
    if (!allowed.includes(file.type)) {
      this.setImageError(slot, this.L().logos.unsupported);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      this.setImageError(slot, this.L().logos.tooLarge);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.setImageError(slot, null);
      this.images.update((images) => ({ ...images, [slot]: String(reader.result ?? '') }));
      this.draftChanged();
    };
    reader.readAsDataURL(file);
  }

  protected removeImage(slot: BrandImageSlot): void {
    this.setImageError(slot, null);
    this.images.update((images) => {
      const next = { ...images };
      delete next[slot];
      return next;
    });
    this.draftChanged();
  }

  private setImageError(slot: BrandImageSlot, message: string | null): void {
    this.imageErrors.update((errors) => {
      const next = { ...errors };
      if (message) {
        next[slot] = message;
      } else {
        delete next[slot];
      }
      return next;
    });
  }

  // ---- typography and design tokens (template helpers) ----

  protected fontWeightControl(key: FontWeightKey): FormControl<number | null> {
    return this.form.controls.typography.controls.fontWeight.controls[key];
  }

  protected lineHeightControl(key: LineHeightKey): FormControl<number | null> {
    return this.form.controls.typography.controls.lineHeight.controls[key];
  }

  protected radiusControl(key: RadiusKey): FormControl<string> {
    return this.form.controls.designTokens.controls.radius.controls[key];
  }

  // ---- actions ----

  protected newConfig(): void {
    this.withDiscardCheck(() => this.created.emit(this.L().configs.newName));
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saved.emit(this.currentDraft());
  }

  /** Back to the stored configuration; the live preview follows */
  protected reset(): void {
    this.currentDraft.set(this.fillForm(this.config() ?? {}));
    this.imageErrors.set({});
    this.preview.emit(this.currentDraft());
  }

  protected activateSelected(): void {
    const item = this.selectedItem();
    if (!item || !this.canActivate()) {
      return;
    }
    this.activated.emit(item.id);
  }

  protected deleteSelected(): void {
    const item = this.selectedItem();
    if (!item || !this.canDelete()) {
      return;
    }
    const labels = this.L().configs;
    this.pendingConfirm = () => this.deleted.emit(item.id);
    this.pendingCancel = null;
    this.confirmDialog?.open(
      labels.deleteTitle,
      fill(item.isCurrent ? labels.deleteActiveMessage : labels.deleteMessage, item.name),
      this.deleteLabel(),
    );
  }
}

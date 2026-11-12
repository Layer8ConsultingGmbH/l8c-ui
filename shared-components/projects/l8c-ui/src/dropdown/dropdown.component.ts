import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { L8cIconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';
import {
  arrayInput,
  booleanInput,
  cssLengthInput,
  oneOf,
  optionalStringInput,
  stringInput,
  type BooleanInput,
  type CssLengthInput,
  type StringInput,
} from '../shared/input-validation';

const ICON_POSITIONS = ['left', 'right'] as const;
export type DropdownIconPosition = (typeof ICON_POSITIONS)[number];
const C = 'l8c-dropdown';

function toCssLength(value: number | string | undefined): string | null {
  if (value === undefined || value === '') {
    return null;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

export interface DropdownOption {
  label: string;
  value?: string;
  icon?: IconName;
  iconAlternative?: IconName;
  isActive?: boolean;
  submenu?: DropdownOption[];
}

@Component({
  selector: 'l8c-dropdown',
  imports: [L8cIconComponent],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cDropdownComponent {
  readonly options = input<string[], readonly string[] | null | undefined>([], {
    transform: arrayInput(C, 'options'),
  });
  readonly optionsWithSubmenus = input<
    DropdownOption[],
    readonly DropdownOption[] | null | undefined
  >([], { transform: arrayInput(C, 'optionsWithSubmenus') });
  readonly selected = input<string, StringInput>('', { transform: stringInput(C, 'selected', '') });
  readonly defaultValue = input<string, StringInput>('', {
    transform: stringInput(C, 'defaultValue', ''),
  });
  // true shows the selected value, false always shows the default value
  readonly showSelectedValue = input<boolean, BooleanInput>(true, {
    transform: booleanInput(C, 'showSelectedValue', true),
  });
  // Icon support
  readonly icon = input<IconName | undefined>(undefined);
  readonly iconAlternative = input<IconName | undefined>(undefined);
  readonly iconPosition = input<DropdownIconPosition, DropdownIconPosition | null | undefined>(
    'left',
    { transform: oneOf(C, 'iconPosition', ICON_POSITIONS, 'left') },
  );
  // Optional custom styling
  // Button/Toggle style
  readonly backgroundColor = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'backgroundColor'),
  });
  readonly border = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'border'),
  });
  readonly borderRadius = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'borderRadius'),
  });
  readonly color = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'color'),
  });
  readonly minWidth = input<number | string | undefined, CssLengthInput>(undefined, {
    transform: cssLengthInput(C, 'minWidth', undefined),
  });
  // Menu style
  readonly menuBackgroundColor = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'menuBackgroundColor'),
  });
  readonly menuBorder = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'menuBorder'),
  });
  readonly menuBorderRadius = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'menuBorderRadius'),
  });
  readonly menuColor = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'menuColor'),
  });
  readonly menuMinWidth = input<number | string | undefined, CssLengthInput>(undefined, {
    transform: cssLengthInput(C, 'menuMinWidth', undefined),
  });
  readonly selectionGroup = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'selectionGroup'),
  });

  readonly selectedValue = output<string>();

  // Effective selection: follows the selected input, falls back to the
  // default value, and can be overwritten by a local selection
  private readonly selectedState = linkedSignal(() => this.selected() || this.defaultValue());

  readonly open = signal(false);
  readonly hovered = signal('');
  readonly hoveredToggle = signal(false);
  readonly openSubmenu = signal<string | null>(null);

  readonly isActiveSelection = computed(
    () =>
      !!this.selectionGroup() &&
      this.selectedState() !== '' &&
      this.selectedState() !== this.defaultValue(),
  );

  readonly hasSubmenus = computed(() => this.optionsWithSubmenus().length > 0);

  /** `minWidth` as a CSS length (px numbers get their unit), or null when unset */
  readonly minWidthCss = computed(() => toCssLength(this.minWidth()));
  readonly menuMinWidthCss = computed(() => toCssLength(this.menuMinWidth()));

  readonly displayValue = computed(() =>
    this.showSelectedValue() ? this.selectedState() : this.defaultValue(),
  );

  private closeTimeout: ReturnType<typeof setTimeout> | null = null;

  select(option: string) {
    this.clearCloseTimeout();
    this.selectedState.set(option);
    this.selectedValue.emit(option);
    this.open.set(false);
    this.openSubmenu.set(null);
  }

  selectFromSubmenu(value: string) {
    this.clearCloseTimeout();
    this.selectedState.set(value);
    this.selectedValue.emit(value);
    this.open.set(false);
    this.openSubmenu.set(null);
  }

  toggleSubmenu(label: string, event: MouseEvent) {
    event.stopPropagation();
    this.openSubmenu.set(this.openSubmenu() === label ? null : label);
  }

  onItemMouseEnter(label: string, hasSubmenu: boolean) {
    this.hovered.set(label);
    this.openSubmenu.set(hasSubmenu ? label : null);
  }

  toggle() {
    this.open.update((open) => !open);
    if (!this.open()) {
      this.openSubmenu.set(null);
    }
  }

  onButtonEnter() {
    this.clearCloseTimeout();
    this.open.set(true);
    this.hoveredToggle.set(true);
  }

  onButtonLeave() {
    this.hoveredToggle.set(false);
    this.startCloseTimeout();
  }

  onMenuEnter() {
    this.clearCloseTimeout();
  }

  onMenuLeave() {
    this.startCloseTimeout();
  }

  private clearCloseTimeout() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  private startCloseTimeout() {
    this.clearCloseTimeout();
    this.closeTimeout = setTimeout(() => {
      this.open.set(false);
      this.openSubmenu.set(null);
      this.hoveredToggle.set(false);
      this.closeTimeout = null;
    }, 100);
  }
}

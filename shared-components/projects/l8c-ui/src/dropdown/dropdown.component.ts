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
  readonly options = input<string[]>([]);
  readonly optionsWithSubmenus = input<DropdownOption[]>([]);
  readonly selected = input<string>('');
  readonly defaultValue = input<string>('');
  // true shows the selected value, false always shows the default value
  readonly showSelectedValue = input<boolean>(true);
  // Icon support
  readonly icon = input<IconName | undefined>(undefined);
  readonly iconAlternative = input<IconName | undefined>(undefined);
  readonly iconPosition = input<'left' | 'right'>('left');
  // Optional custom styling
  // Button/Toggle style
  readonly backgroundColor = input<string | undefined>(undefined);
  readonly border = input<string | undefined>(undefined);
  readonly borderRadius = input<string | undefined>(undefined);
  readonly color = input<string | undefined>(undefined);
  readonly minWidth = input<string | undefined>(undefined);
  // Menu style
  readonly menuBackgroundColor = input<string | undefined>(undefined);
  readonly menuBorder = input<string | undefined>(undefined);
  readonly menuBorderRadius = input<string | undefined>(undefined);
  readonly menuColor = input<string | undefined>(undefined);
  readonly menuMinWidth = input<string | undefined>(undefined);
  readonly selectionGroup = input<string | undefined>(undefined);

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

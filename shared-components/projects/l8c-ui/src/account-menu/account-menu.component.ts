import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { L8cIconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';

export interface AccountMenuOption {
  label: string;
  value: string;
  icon?: IconName;
  type?: 'action' | 'divider' | 'header' | 'button-group';
  buttons?: AccountMenuButton[];
}

export interface AccountMenuButton {
  label: string;
  value: string;
  icon?: IconName;
  isActive?: boolean;
}

@Component({
  selector: 'l8c-account-menu',
  imports: [L8cIconComponent],
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
})
export class L8cAccountMenuComponent {
  userName = input.required<string>();
  menuOptions = input.required<AccountMenuOption[]>();

  optionSelected = output<string>();

  isOpen = signal(false);
  hoveredOption = signal<string | null>(null);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  close() {
    this.isOpen.set(false);
  }

  selectOption(value: string) {
    this.optionSelected.emit(value);

    const keepOpenValues = ['Dark', 'Light', 'EN', 'DE'];
    if (!keepOpenValues.includes(value)) {
      this.close();
    }
  }

  onOptionHover(value: string | null) {
    this.hoveredOption.set(value);
  }

  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-menu')) {
      this.close();
    }
  }
}

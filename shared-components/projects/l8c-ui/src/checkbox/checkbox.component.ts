import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { L8cIconComponent } from '../icon/icon.component';

/**
 * Custom-styled checkbox with a projected label.
 *
 * Two-way bindable via `[(checked)]`; typical list usage binds `[checked]`
 * and reacts to `(checkedChange)`.
 */
@Component({
  selector: 'l8c-checkbox',
  imports: [L8cIconComponent],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cCheckboxComponent {
  checked = model<boolean>(false);
  disabled = input<boolean>(false);
  ariaLabel = input<string | undefined>(undefined);

  onToggle(): void {
    if (!this.disabled()) {
      this.checked.set(!this.checked());
    }
  }
}

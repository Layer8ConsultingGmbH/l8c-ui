import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { L8cIconComponent } from '../icon/icon.component';
import {
  BooleanInput,
  booleanInput,
  optionalStringInput,
  StringInput,
} from '../shared/input-validation';

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
  disabled = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-checkbox', 'disabled'),
  });
  ariaLabel = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-checkbox', 'ariaLabel'),
  });

  onToggle(): void {
    if (!this.disabled()) {
      this.checked.set(!this.checked());
    }
  }
}

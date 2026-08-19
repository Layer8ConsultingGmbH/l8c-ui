import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export type RadioAppearance = 'plain' | 'row';

/**
 * Custom-styled radio button with a projected label.
 *
 * Group radios via the `name` input; the parent owns the selection state:
 * bind `[checked]` per option and react to `(checkedChange)`, which fires
 * with `true` when the option is picked.
 *
 * Appearances: 'plain' renders circle + label, 'row' renders a framed,
 * selectable row (highlighted while checked).
 */
@Component({
  selector: 'l8c-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cRadioComponent {
  checked = model<boolean>(false);
  /** Native radio group name */
  name = input<string>('');
  appearance = input<RadioAppearance>('plain');
  disabled = input<boolean>(false);
  ariaLabel = input<string | undefined>(undefined);

  onSelect(): void {
    if (!this.disabled()) {
      this.checked.set(true);
    }
  }
}

import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import {
  BooleanInput,
  booleanInput,
  oneOf,
  optionalStringInput,
  stringInput,
  StringInput,
} from '../shared/input-validation';

const RADIO_APPEARANCES = ['plain', 'row'] as const;
export type RadioAppearance = (typeof RADIO_APPEARANCES)[number];

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
  name = input<string, StringInput>('', { transform: stringInput('l8c-radio', 'name', '') });
  appearance = input<RadioAppearance, RadioAppearance | null | undefined>('plain', {
    transform: oneOf('l8c-radio', 'appearance', RADIO_APPEARANCES, 'plain'),
  });
  disabled = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-radio', 'disabled'),
  });
  ariaLabel = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-radio', 'ariaLabel'),
  });

  onSelect(): void {
    if (!this.disabled()) {
      this.checked.set(true);
    }
  }
}

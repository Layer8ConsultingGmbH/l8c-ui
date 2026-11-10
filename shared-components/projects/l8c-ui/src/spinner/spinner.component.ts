import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  BooleanInput,
  booleanInput,
  oneOf,
  optionalStringInput,
  StringInput,
} from '../shared/input-validation';

const SPINNER_SIZES = ['small', 'medium', 'large'] as const;
type SpinnerSize = (typeof SPINNER_SIZES)[number];

/**
 * Loading spinner component
 * Displays an animated spinner to indicate loading state
 *
 * @example
 * <app-spinner />
 * <app-spinner [size]="'large'" />
 * <app-spinner [overlay]="true" />
 */
@Component({
  selector: 'l8c-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cSpinnerComponent {
  /** Size variant of the spinner */
  readonly size = input<SpinnerSize, SpinnerSize | null | undefined>('medium', {
    transform: oneOf('l8c-spinner', 'size', SPINNER_SIZES, 'medium'),
  });

  /** Whether to show as overlay with backdrop */
  readonly overlay = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-spinner', 'overlay'),
  });

  /** Optional message to display below spinner */
  readonly message = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-spinner', 'message'),
  });
}

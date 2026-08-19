import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  /** Whether to show as overlay with backdrop */
  readonly overlay = input<boolean>(false);

  /** Optional message to display below spinner */
  readonly message = input<string | undefined>(undefined);
}

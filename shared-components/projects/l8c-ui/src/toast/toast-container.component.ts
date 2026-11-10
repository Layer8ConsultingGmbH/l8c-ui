import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { L8cToastComponent } from './toast.component';
import { L8cToastService } from './toast.service';
import { StringInput, stringInput } from '../shared/input-validation';

/**
 * Shows the toasts of `L8cToastService` fixed top right below the top
 * navigation, oldest first. Place it once in the app shell, outside any
 * layout switch, so toasts show on every page and survive navigation.
 *
 * `dismissLabel` is the accessible name and tooltip of the dismiss button
 * of error toasts - pass a translated value from the host app.
 **/
@Component({
  selector: 'l8c-toast-container',
  imports: [L8cToastComponent],
  template: `
    @for (toast of toasts.toasts(); track toast.id) {
      <l8c-toast
        [tone]="toast.tone"
        [message]="toast.message"
        [dismissLabel]="dismissLabel()"
        (dismissed)="toasts.dismiss(toast.id)"
      />
    }
  `,
  styles: `
    :host {
      position: fixed;
      top: calc(var(--top-nav-min-height, 64px) + 12px);
      right: var(--spacing-lg, 20px);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      // Keeps every toast inside narrow viewports
      max-width: calc(100vw - 2 * var(--spacing-lg, 20px));
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cToastContainerComponent {
  protected readonly toasts = inject(L8cToastService);

  dismissLabel = input<string, StringInput>('Close', {
    transform: stringInput('l8c-toast-container', 'dismissLabel', 'Close'),
  });
}

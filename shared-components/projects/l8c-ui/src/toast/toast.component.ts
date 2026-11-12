import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { L8cButtonComponent } from '../button/button.component';
import { L8cIconComponent } from '../icon/icon.component';
import { ToastTone } from './toast.service';
import { StringInput, oneOf, stringInput } from '../shared/input-validation';

const TOAST_TONES: readonly ToastTone[] = ['info', 'success', 'error'];

/**
 * One toast after the design system (info, success, error). Only error
 * toasts have a dismiss button, the others close on their own.
 *
 * Usually rendered by `l8c-toast-container`; all texts are finished
 * strings - pass translated values from the host app.
 */
@Component({
  selector: 'l8c-toast',
  imports: [L8cButtonComponent, L8cIconComponent],
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.role]': "tone() === 'error' ? 'alert' : 'status'",
  },
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cToastComponent {
  tone = input.required<ToastTone, ToastTone | null | undefined>({
    transform: oneOf('l8c-toast', 'tone', TOAST_TONES, 'info'),
  });
  message = input.required<string, StringInput>({
    transform: stringInput('l8c-toast', 'message', ''),
  });
  /** Accessible name and tooltip of the dismiss button of error toasts */
  dismissLabel = input<string, StringInput>('', {
    transform: stringInput('l8c-toast', 'dismissLabel', ''),
  });

  dismissed = output<void>();
}

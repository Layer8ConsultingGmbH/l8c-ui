import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { L8cDialogComponent } from '../dialog/dialog.component';
import { L8cButtonComponent } from '../button/button.component';
import { StringInput, oneOf, stringInput } from '@l8c/ui/internal';

const MODES = ['confirm', 'info'] as const;
export type ConfirmDialogMode = (typeof MODES)[number];

/**
 * Modal dialog for a decision or a message, in two modes:
 *
 * - `mode="confirm"` (default): a cancel and a confirm button. Emits
 *   `confirmed` or `cancelled`.
 * - `mode="info"`: a single button (`closeLabel`) for messages that need no
 *   decision, e.g. why an action could not run. Emits `closed`, neither
 *   `confirmed` nor `cancelled`.
 *
 * Escape counts as dismissing: `cancelled` in confirm mode, `closed` in info
 * mode.
 *
 * Open it imperatively via `open(title, message, confirmLabel?)`; all texts
 * are finished strings - pass translated values from the host app. The
 * message keeps its line breaks, and a long message scrolls while the
 * buttons stay visible. The `confirmLabel` input is the default; the
 * `open()` parameter overrides it per call (confirm mode only).
 */
@Component({
  selector: 'l8c-confirm-dialog',
  imports: [L8cDialogComponent, L8cButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cConfirmDialogComponent {
  @ViewChild(L8cDialogComponent) dialog!: L8cDialogComponent;

  /** 'confirm' (default): cancel + confirm. 'info': one close button, no decision */
  mode = input<ConfirmDialogMode, ConfirmDialogMode | null | undefined>('confirm', {
    transform: oneOf('l8c-confirm-dialog', 'mode', MODES, 'confirm'),
  });
  /** Confirm mode: label of the cancel button */
  cancelLabel = input<string, StringInput>('Cancel', {
    transform: stringInput('l8c-confirm-dialog', 'cancelLabel', 'Cancel'),
  });
  /** Confirm mode: label of the action button */
  confirmLabel = input<string, StringInput>('OK', {
    transform: stringInput('l8c-confirm-dialog', 'confirmLabel', 'OK'),
  });
  /** Info mode: label of the single button */
  closeLabel = input<string, StringInput>('Close', {
    transform: stringInput('l8c-confirm-dialog', 'closeLabel', 'Close'),
  });

  confirmed = output<void>();
  cancelled = output<void>();
  /** Info mode: the dialog was closed, by its button or Escape */
  closed = output<void>();

  title = signal<string>('');
  message = signal<string>('');

  private confirmLabelOverride = signal<string | null>(null);
  displayConfirmLabel = computed(() => this.confirmLabelOverride() ?? this.confirmLabel());

  private wasConfirmed = false;
  /** True while this component closes the dialog itself and reports the outcome */
  private closing = false;

  open(title: string, message: string, confirmLabel?: string): void {
    this.title.set(title);
    this.message.set(message);
    this.confirmLabelOverride.set(confirmLabel ?? null);
    this.wasConfirmed = false;
    this.dialog.open();
  }

  close(): void {
    this.closeDialog();
    if (this.mode() === 'info') {
      this.closed.emit();
    } else if (!this.wasConfirmed) {
      this.cancelled.emit();
    }
    this.wasConfirmed = false;
  }

  onConfirm(): void {
    this.wasConfirmed = true;
    this.confirmed.emit();
    this.closeDialog();
    this.wasConfirmed = false;
  }

  /** The dialog closed without one of the buttons (Escape): report it as dismissed */
  protected onDialogClosed(): void {
    if (this.closing) {
      return;
    }
    if (this.mode() === 'info') {
      this.closed.emit();
    } else {
      this.cancelled.emit();
    }
  }

  private closeDialog(): void {
    this.closing = true;
    this.dialog.close();
    this.closing = false;
  }
}

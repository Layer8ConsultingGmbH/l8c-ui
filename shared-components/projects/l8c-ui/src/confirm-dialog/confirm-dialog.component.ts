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

/**
 * Modal confirm dialog with a cancel and a confirm button.
 *
 * Open it imperatively via `open(title, message, confirmLabel?)`; all texts
 * are finished strings - pass translated values from the host app. The
 * `confirmLabel` input is the default; the `open()` parameter overrides it
 * per call (e.g. "Close" for a pure info dialog).
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

  cancelLabel = input<string>('Cancel');
  confirmLabel = input<string>('OK');

  confirmed = output<void>();
  cancelled = output<void>();

  title = signal<string>('');
  message = signal<string>('');

  private confirmLabelOverride = signal<string | null>(null);
  displayConfirmLabel = computed(() => this.confirmLabelOverride() ?? this.confirmLabel());

  private wasConfirmed = false;

  open(title: string, message: string, confirmLabel?: string): void {
    this.title.set(title);
    this.message.set(message);
    this.confirmLabelOverride.set(confirmLabel ?? null);
    this.wasConfirmed = false;
    this.dialog.open();
  }

  close(): void {
    this.dialog.close();
    if (!this.wasConfirmed) {
      this.cancelled.emit();
    }
    this.wasConfirmed = false;
  }

  onConfirm(): void {
    this.wasConfirmed = true;
    this.confirmed.emit();
    this.dialog.close();
    this.wasConfirmed = false;
  }
}

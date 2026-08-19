import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { L8cIconComponent } from '../icon/icon.component';

@Component({
  selector: 'l8c-dialog',
  imports: [L8cIconComponent],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cDialogComponent {
  @ViewChild('dialog') dialogElement!: ElementRef<HTMLDialogElement>;

  title = input<string>('');
  showCloseButton = input<boolean>(true);
  closed = output<void>();

  open(): void {
    this.dialogElement.nativeElement.showModal();
  }

  close(): void {
    this.dialogElement.nativeElement.close();
    this.closed.emit();
  }
}

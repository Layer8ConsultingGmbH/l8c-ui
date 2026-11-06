import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonAction, L8cButtonComponent } from '../button/button.component';
import { L8cIconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';

/** A chosen file as listed below the drop zone; a File is one */
export interface FileInputItem {
  name: string;
  size?: number;
}

/** "12 KB" / "1.5 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * File selection without the browser's native control. `variant="dropzone"`
 * (default) is a dashed drop area with a choose button and the chosen files
 * listed below; `variant="button"` is just a button that opens the file
 * dialog, for dialogs that act right after the choice. The native input
 * stays hidden in the DOM. `filesChange` gets an array of File objects (one
 * unless `multiple`); `accept` filters the browser dialog only, so validate
 * type and size in the host and show the result through `error`. All texts
 * are finished strings.
 */
@Component({
  selector: 'l8c-file-input',
  imports: [L8cButtonComponent, L8cIconComponent],
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cFileInputComponent {
  variant = input<'dropzone' | 'button'>('dropzone');
  accept = input<string | undefined>(undefined);
  multiple = input<boolean>(false);
  /** Chosen files, listed below the drop zone */
  files = input<readonly FileInputItem[]>([]);
  label = input<string | undefined>(undefined);
  required = input<boolean>(false);
  hint = input<string | undefined>(undefined);
  error = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  buttonLabel = input<string>('Choose file');
  dropLabel = input<string>('Drop a file here or');
  /** Accessible name prefix of the remove buttons in the file list */
  removeLabel = input<string>('Remove');
  /** Button action of variant "button" */
  buttonAction = input<ButtonAction>('primary');
  /** Icon of the button in variant "button" */
  buttonIcon = input<IconName>('upload');

  /** The chosen files; after a removal the list without the removed file */
  filesChange = output<File[]>();
  /** A file removed from the list, with its index */
  removed = output<{ item: FileInputItem; index: number }>();

  protected readonly dragging = signal(false);

  private readonly native = viewChild.required<ElementRef<HTMLInputElement>>('native');

  /** Opens the browser's file dialog */
  choose(): void {
    if (!this.disabled()) {
      this.native().nativeElement.click();
    }
  }

  protected onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.take(input.files);
    // Reset so selecting the same file again fires another change event
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) {
      this.take(event.dataTransfer?.files ?? null);
    }
  }

  protected remove(index: number): void {
    const item = this.files()[index];
    if (!item) {
      return;
    }
    this.removed.emit({ item, index });
    const remaining = this.files().filter((_, position) => position !== index);
    this.filesChange.emit(remaining.filter((file): file is File => file instanceof File));
  }

  protected size(item: FileInputItem): string | null {
    return typeof item.size === 'number' ? formatFileSize(item.size) : null;
  }

  private take(list: FileList | null): void {
    const files = Array.from(list ?? []);
    if (files.length === 0) {
      return;
    }
    this.filesChange.emit(this.multiple() ? files : files.slice(0, 1));
  }
}

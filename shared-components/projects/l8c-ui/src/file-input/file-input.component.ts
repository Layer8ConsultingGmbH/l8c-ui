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
import { IconName, isIconName } from '../icon/icon-registry';
import {
  BooleanInput,
  StringInput,
  arrayInput,
  booleanInput,
  oneOf,
  optionalStringInput,
  stringInput,
  warnInvalidInput,
} from '../shared/input-validation';

const VARIANTS = ['dropzone', 'button'] as const;
type Variant = (typeof VARIANTS)[number];
// Mirrors ButtonAction of l8c-button, which exports the type only
const BUTTON_ACTIONS: readonly ButtonAction[] = [
  'primary',
  'nav',
  'secondary',
  'ghost',
  'tab',
  'danger',
];

function buttonIconInput(value: IconName | null | undefined): IconName {
  if (value === null || value === undefined) {
    return 'upload';
  }
  if (isIconName(value)) {
    return value;
  }
  warnInvalidInput('l8c-file-input', 'buttonIcon', value, 'unknown icon, using "upload"');
  return 'upload';
}

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
  variant = input<Variant, Variant | null | undefined>('dropzone', {
    transform: oneOf('l8c-file-input', 'variant', VARIANTS, 'dropzone'),
  });
  accept = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-file-input', 'accept'),
  });
  multiple = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-file-input', 'multiple'),
  });
  /** Chosen files, listed below the drop zone */
  files = input<readonly FileInputItem[], readonly FileInputItem[] | null | undefined>([], {
    transform: arrayInput<FileInputItem>('l8c-file-input', 'files'),
  });
  label = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-file-input', 'label'),
  });
  required = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-file-input', 'required'),
  });
  hint = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-file-input', 'hint'),
  });
  error = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-file-input', 'error'),
  });
  disabled = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-file-input', 'disabled'),
  });
  buttonLabel = input<string, StringInput>('Choose file', {
    transform: stringInput('l8c-file-input', 'buttonLabel', 'Choose file'),
  });
  dropLabel = input<string, StringInput>('Drop a file here or', {
    transform: stringInput('l8c-file-input', 'dropLabel', 'Drop a file here or'),
  });
  /** Accessible name prefix of the remove buttons in the file list */
  removeLabel = input<string, StringInput>('Remove', {
    transform: stringInput('l8c-file-input', 'removeLabel', 'Remove'),
  });
  /** Button action of variant "button" */
  buttonAction = input<ButtonAction, ButtonAction | null | undefined>('primary', {
    transform: oneOf('l8c-file-input', 'buttonAction', BUTTON_ACTIONS, 'primary'),
  });
  /** Icon of the button in variant "button" */
  buttonIcon = input<IconName, IconName | null | undefined>('upload', {
    transform: buttonIconInput,
  });

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

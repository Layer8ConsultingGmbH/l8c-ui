import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { L8cButtonComponent } from '../button/button.component';
import { StringInput, optionalStringInput, stringInput } from '../shared/input-validation';

let nextId = 0;

/**
 * Read-only value (an ID, a link, a token) with a copy button inside its
 * box at the right end, styled after a disabled l8c-input. Only the button
 * copies: the box is no tab stop, shows no hover or focus state and ignores
 * clicks, so nothing suggests that the value can be edited. After copying,
 * the icon turns into a check for 2 s and `copiedMessage` is announced
 * through a live region below the box. Copying fails silently outside
 * secure contexts. All texts are finished strings.
 */
@Component({
  selector: 'l8c-copy-field',
  imports: [L8cButtonComponent],
  templateUrl: './copy-field.component.html',
  styleUrls: ['./copy-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cCopyFieldComponent {
  label = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-copy-field', 'label'),
  });
  value = input.required<string, StringInput>({
    transform: stringInput('l8c-copy-field', 'value', ''),
  });
  /** Accessible name and tooltip of the copy button */
  copyLabel = input<string, StringInput>('Copy', {
    transform: stringInput('l8c-copy-field', 'copyLabel', 'Copy'),
  });
  /** Confirmation announced for a short moment after copying */
  copiedMessage = input<string, StringInput>('', {
    transform: stringInput('l8c-copy-field', 'copiedMessage', ''),
  });
  /** The value, right after it was copied */
  copied$ = output<string>({ alias: 'copiedValue' });

  protected readonly labelId = `l8c-copy-field-label-${nextId++}`;

  /** Swaps the copy icon for a check mark for a short moment after copying */
  readonly copied = signal(false);
  private copiedTimeout?: ReturnType<typeof setTimeout>;

  async copy(): Promise<void> {
    const value = this.value();
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access is denied outside secure contexts or without permission
      return;
    }
    this.copied.set(true);
    this.copied$.emit(value);
    clearTimeout(this.copiedTimeout);
    this.copiedTimeout = setTimeout(() => this.copied.set(false), 2000);
  }
}

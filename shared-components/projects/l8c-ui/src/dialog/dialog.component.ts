import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  output,
} from '@angular/core';
import { L8cIconComponent } from '../icon/icon.component';
import {
  BooleanInput,
  CssLengthInput,
  StringInput,
  booleanInput,
  cssLengthInput,
  oneOf,
  stringInput,
} from '../shared/input-validation';

const CONTENT_LAYOUTS = ['scroll', 'flex'] as const;
type ContentLayout = (typeof CONTENT_LAYOUTS)[number];

/**
 * Modal dialog with a blurred backdrop: header (title + close) and a
 * scrollable content area. Open and close it imperatively via `open()` and
 * `close()`.
 *
 * Width: the `width` input (px number or any CSS length) or the custom
 * property `--dialog-width` on any ancestor; default 520px. The dialog is
 * never wider than the viewport. Set the property in the app instead of
 * overriding the component's styles.
 *
 * Layout: the dialog is a flex column capped at 90vh; the header keeps its
 * height and only the content scrolls. With `contentLayout="flex"` the
 * content area is itself a flex column that does not scroll, so projected
 * content can pin its own footer and scroll its own parts. The content
 * keeps an 8px inner gutter (balanced by a negative margin), so focus rings
 * and hover glows at its edge are not clipped.
 */
@Component({
  selector: 'l8c-dialog',
  imports: [L8cIconComponent],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cDialogComponent {
  @ViewChild('dialog') dialogElement!: ElementRef<HTMLDialogElement>;

  title = input<string, StringInput>('', { transform: stringInput('l8c-dialog', 'title', '') });
  showCloseButton = input<boolean, BooleanInput>(true, {
    transform: booleanInput('l8c-dialog', 'showCloseButton', true),
  });
  /** Width as px number or CSS length; unset: `--dialog-width` of an ancestor, else 520px */
  width = input<number | string | undefined, CssLengthInput>(undefined, {
    transform: cssLengthInput('l8c-dialog', 'width', undefined),
  });
  /**
   * 'scroll' (default): the content area scrolls. 'flex': it is a flex
   * column without own scrolling, for content that scrolls a part of
   * itself and pins the rest
   */
  contentLayout = input<ContentLayout, ContentLayout | null | undefined>('scroll', {
    transform: oneOf('l8c-dialog', 'contentLayout', CONTENT_LAYOUTS, 'scroll'),
  });
  closed = output<void>();

  /** The width as a CSS length for the `--dialog-width` property, or null to inherit */
  protected readonly cssWidth = computed<string | null>(() => {
    const width = this.width();
    if (width === undefined || width === null || width === '') {
      return null;
    }
    return typeof width === 'number' ? `${width}px` : width;
  });

  open(): void {
    this.dialogElement.nativeElement.showModal();
  }

  close(): void {
    this.dialogElement.nativeElement.close();
    this.closed.emit();
  }
}

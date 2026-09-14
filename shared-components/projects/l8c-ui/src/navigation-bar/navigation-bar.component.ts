import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { L8cButtonComponent } from '../button/button.component';
import { L8cIconComponent } from '../icon/icon.component';

/**
 * Sticky navigation bar for stepping through a list of numbered items
 * (questions, steps, results, ...): one button per position, previous/next,
 * a jump-to field, and optional back link, done button and a visibility
 * toggle that hides completed positions.
 *
 * The component only works with 1-based position numbers; what an item is,
 * what "completed" means and what happens on selection is up to the parent.
 * All texts are inputs so the host app can pass translations.
 *
 * Custom actions (e.g. several save buttons) can be projected into the top
 * row next to the done button: `<div navActions>...</div>`. The top row is
 * rendered whenever a back or done label is set.
 */
@Component({
  selector: 'l8c-navigation-bar',
  imports: [FormsModule, L8cButtonComponent, L8cIconComponent],
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cNavigationBarComponent {
  // Total number of items
  totalItems = input.required<number>();

  // Currently active item (1-based index)
  activeItem = input<number>(1);

  // Back link on the left (hidden when empty) - keeps the exit reachable
  // without scrolling back to the top
  backLabel = input<string>('');

  // Primary done/submit button on the right (hidden when empty)
  doneLabel = input<string>('');

  // 1-based positions that are info entries - rendered with an info icon
  // instead of their number
  infoPositions = input<number[]>([]);

  // 1-based positions that are completed (e.g. answered) - rendered muted
  // and hideable via the visibility toggle
  completedPositions = input<number[]>([]);

  // Shows the eye toggle that hides completed positions
  showVisibilityToggle = input<boolean>(false);

  // At most this many numbered buttons are rendered at once, as a window
  // that follows the active item; the rest is reachable via previous/next,
  // the jump field or by paging at the window edges
  maxVisibleItems = input<number>(10);

  // Shows "active / total" next to the numbers so the overall length is
  // visible even when the window hides most of them
  showCount = input<boolean>(true);

  // Texts (hidden when empty); pass translated values from the host app
  label = input<string>('');
  jumpLabel = input<string>('');
  jumpPlaceholder = input<string>('#');
  hideCompletedLabel = input<string>('');
  showCompletedLabel = input<string>('');

  // Aria prefixes for the numbered buttons ("<prefix> <number>")
  itemAriaLabel = input<string>('Item');
  infoItemAriaLabel = input<string>('Info');

  // Output event when an item number is clicked
  itemSelected = output<number>();

  backClicked = output<void>();

  doneClicked = output<void>();

  // Jump to item input
  jumpToValue = signal<string>('');

  // Generate array of item numbers for navigation
  itemNumbers = computed<number[]>(() =>
    Array.from({ length: this.totalItems() }, (_, i) => i + 1),
  );

  private infoPositionSet = computed<Set<number>>(() => new Set(this.infoPositions()));

  isInfo(itemNumber: number): boolean {
    return this.infoPositionSet().has(itemNumber);
  }

  private completedPositionSet = computed<Set<number>>(() => new Set(this.completedPositions()));

  isCompleted(itemNumber: number): boolean {
    return this.completedPositionSet().has(itemNumber);
  }

  // Toggled via the visibility button: hide completed items so open ones
  // are quick to reach
  hideCompleted = signal<boolean>(false);

  onToggleCompleted(): void {
    this.hideCompleted.update((value) => !value);
  }

  // Every number that is currently selectable (completed ones may be hidden)
  selectableNumbers = computed<number[]>(() =>
    this.hideCompleted()
      ? this.itemNumbers().filter((num) => !this.completedPositionSet().has(num))
      : this.itemNumbers(),
  );

  // The window of selectable numbers around the active item, clamped to the
  // list bounds so the bar never shows fewer than maxVisibleItems when
  // enough items exist
  visibleNumbers = computed<number[]>(() => {
    const numbers = this.selectableNumbers();
    const max = Math.max(1, this.maxVisibleItems());
    if (numbers.length <= max) {
      return numbers;
    }
    const activeIndex = Math.max(
      0,
      numbers.findIndex((num) => num >= this.activeItem()),
    );
    const start = Math.min(Math.max(0, activeIndex - Math.floor(max / 2)), numbers.length - max);
    return numbers.slice(start, start + max);
  });

  // Whether numbers exist before/after the window - shown as "…" that pages
  // the window by clicking
  hasHiddenBefore = computed<boolean>(() => {
    const visible = this.visibleNumbers();
    return visible.length > 0 && visible[0] !== this.selectableNumbers()[0];
  });

  hasHiddenAfter = computed<boolean>(() => {
    const visible = this.visibleNumbers();
    const all = this.selectableNumbers();
    return visible.length > 0 && visible[visible.length - 1] !== all[all.length - 1];
  });

  // Page the window: select the item one window before/after the current edge
  onPageBefore(): void {
    const all = this.selectableNumbers();
    const firstVisibleIndex = all.indexOf(this.visibleNumbers()[0]);
    const target = all[Math.max(0, firstVisibleIndex - this.maxVisibleItems())];
    this.itemSelected.emit(target);
  }

  onPageAfter(): void {
    const all = this.selectableNumbers();
    const visible = this.visibleNumbers();
    const lastVisibleIndex = all.indexOf(visible[visible.length - 1]);
    const target = all[Math.min(all.length - 1, lastVisibleIndex + this.maxVisibleItems())];
    this.itemSelected.emit(target);
  }

  onItemClick(itemNumber: number): void {
    this.itemSelected.emit(itemNumber);
  }

  onPrevious(): void {
    const current = this.activeItem();
    if (current > 1) {
      this.itemSelected.emit(current - 1);
    }
  }

  onNext(): void {
    const current = this.activeItem();
    if (current < this.totalItems()) {
      this.itemSelected.emit(current + 1);
    }
  }

  onJumpTo(): void {
    const value = parseInt(this.jumpToValue(), 10);
    if (!isNaN(value) && value >= 1 && value <= this.totalItems()) {
      this.itemSelected.emit(value);
      this.jumpToValue.set('');
    }
  }

  canGoPrevious = computed<boolean>(() => this.activeItem() > 1);

  canGoNext = computed<boolean>(() => this.activeItem() < this.totalItems());
}

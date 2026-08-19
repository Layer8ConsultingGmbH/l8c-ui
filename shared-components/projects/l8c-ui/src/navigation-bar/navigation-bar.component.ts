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

  visibleNumbers = computed<number[]>(() =>
    this.hideCompleted()
      ? this.itemNumbers().filter((num) => !this.completedPositionSet().has(num))
      : this.itemNumbers(),
  );

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

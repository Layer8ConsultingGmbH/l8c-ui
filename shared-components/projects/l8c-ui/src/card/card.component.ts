import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

@Component({
  selector: 'l8c-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cCardComponent {
  readonly title = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly elevation = input<'none' | 'low' | 'medium' | 'high'>('low');
  readonly clickable = input<boolean>(false);
  readonly padding = input<'none' | 'small' | 'medium' | 'large'>('medium');
  readonly collapsible = input<boolean>(false);
  readonly isExpanded = input<boolean | undefined>(undefined);

  readonly cardClick = output<void>();
  readonly expandedChange = output<boolean>();

  readonly isHovered = signal(false);
  readonly collapsed = signal(false);

  readonly elevationClass = computed(() => `elevation-${this.elevation()}`);
  readonly paddingClass = computed(() => `padding-${this.padding()}`);

  constructor() {
    // Sync the collapsed state when the isExpanded input changes
    effect(() => {
      const value = this.isExpanded();
      if (value !== undefined && untracked(this.collapsible)) {
        this.collapsed.set(!value);
      }
    });
  }

  onClick(event: Event) {
    if (this.clickable()) {
      this.cardClick.emit();
    }
  }

  toggleCollapse(event: Event) {
    event.stopPropagation();
    const newCollapsedState = !this.collapsed();
    this.collapsed.set(newCollapsedState);
    this.expandedChange.emit(!newCollapsedState);
  }
}

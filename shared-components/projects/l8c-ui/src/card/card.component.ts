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
import {
  BooleanInput,
  booleanInput,
  oneOf,
  optionalStringInput,
  StringInput,
} from '../shared/input-validation';

const CARD_ELEVATIONS = ['none', 'low', 'medium', 'high'] as const;
const CARD_PADDINGS = ['none', 'small', 'medium', 'large'] as const;
type CardElevation = (typeof CARD_ELEVATIONS)[number];
type CardPadding = (typeof CARD_PADDINGS)[number];

/** `isExpanded` stays `undefined` (uncontrolled) unless a boolean-like value is given */
function expandedInput(value: BooleanInput): boolean | undefined {
  return value === null || value === undefined
    ? undefined
    : booleanInput('l8c-card', 'isExpanded')(value);
}

@Component({
  selector: 'l8c-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cCardComponent {
  readonly title = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-card', 'title'),
  });
  readonly subtitle = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-card', 'subtitle'),
  });
  readonly elevation = input<CardElevation, CardElevation | null | undefined>('low', {
    transform: oneOf('l8c-card', 'elevation', CARD_ELEVATIONS, 'low'),
  });
  readonly clickable = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-card', 'clickable'),
  });
  readonly padding = input<CardPadding, CardPadding | null | undefined>('medium', {
    transform: oneOf('l8c-card', 'padding', CARD_PADDINGS, 'medium'),
  });
  readonly collapsible = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-card', 'collapsible'),
  });
  readonly isExpanded = input<boolean | undefined, BooleanInput>(undefined, {
    transform: expandedInput,
  });

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

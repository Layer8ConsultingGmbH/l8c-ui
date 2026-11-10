import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  AfterViewChecked,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { L8cIconComponent } from '../icon/icon.component';
import { IconName, isIconName } from '../icon/icon-registry';
import {
  BooleanInput,
  booleanInput,
  oneOf,
  optionalStringInput,
  StringInput,
  warnInvalidInput,
} from '../shared/input-validation';

const BUTTON_ACTIONS = ['primary', 'nav', 'secondary', 'ghost', 'tab', 'danger'] as const;
const BUTTON_SIZES = ['default', 'mini', 'large'] as const;
const BUTTON_TONES = ['default', 'primary', 'danger', 'success', 'warning'] as const;
const BUTTON_TYPES = ['button', 'submit'] as const;

export type ButtonAction = (typeof BUTTON_ACTIONS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type ButtonIconType = IconName | 'none';
export type ButtonTone = (typeof BUTTON_TONES)[number];

function buttonIcon(value: ButtonIconType | null | undefined): ButtonIconType {
  if (value === null || value === undefined || value === 'none' || isIconName(value)) {
    return value ?? 'none';
  }
  warnInvalidInput('l8c-button', 'icon', value, 'unknown icon name, using "none"');
  return 'none';
}

@Component({
  selector: 'l8c-button',
  imports: [CommonModule, L8cIconComponent],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.button-hovered]': 'isHovered()',
    '(mouseenter)': 'isHovered.set(true)',
    '(mouseleave)': 'isHovered.set(false)',
  },
})
export class L8cButtonComponent implements AfterViewChecked {
  action = input<ButtonAction, ButtonAction | null | undefined>('nav', {
    transform: oneOf('l8c-button', 'action', BUTTON_ACTIONS, 'nav'),
  });
  icon = input<ButtonIconType, ButtonIconType | null | undefined>('none', {
    transform: buttonIcon,
  });
  size = input<ButtonSize, ButtonSize | null | undefined>('default', {
    transform: oneOf('l8c-button', 'size', BUTTON_SIZES, 'default'),
  });
  /** Icon-only buttons: semantic recoloring of icon + hover border (DS IconButton `tone`) */
  tone = input<ButtonTone, ButtonTone | null | undefined>('default', {
    transform: oneOf('l8c-button', 'tone', BUTTON_TONES, 'default'),
  });
  type = input<'button' | 'submit', 'button' | 'submit' | null | undefined>('button', {
    transform: oneOf('l8c-button', 'type', BUTTON_TYPES, 'button'),
  });
  disabled = input<boolean, BooleanInput>(false, {
    transform: booleanInput('l8c-button', 'disabled'),
  });
  active = input<boolean, BooleanInput>(false, { transform: booleanInput('l8c-button', 'active') });
  ariaLabel = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput('l8c-button', 'ariaLabel'),
  });

  clicked = output<void>();

  protected isHovered = signal(false);

  private label = viewChild.required<ElementRef<HTMLElement>>('label');
  /** Whether text is projected next to the icon — icon-only styling must not apply then */
  protected hasText = signal(false);

  ngAfterViewChecked(): void {
    this.hasText.set((this.label().nativeElement.textContent ?? '').trim().length > 0);
  }

  protected iconName = computed<IconName | null>(() => {
    const iconValue = this.icon();
    return iconValue !== 'none' ? iconValue : null;
  });

  protected iconSize = computed(() =>
    this.size() === 'mini' ? 16 : this.size() === 'large' ? 22 : 18,
  );

  onClick(event: Event) {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}

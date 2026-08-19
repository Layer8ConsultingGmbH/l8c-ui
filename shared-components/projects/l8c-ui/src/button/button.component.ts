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
import { IconName } from '../icon/icon-registry';

export type ButtonAction = 'primary' | 'nav' | 'secondary' | 'ghost' | 'tab' | 'danger';
export type ButtonSize = 'default' | 'mini' | 'large';
export type ButtonIconType = IconName | 'none';
export type ButtonTone = 'default' | 'primary' | 'danger' | 'success' | 'warning';

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
  action = input<ButtonAction>('nav');
  icon = input<ButtonIconType>('none');
  size = input<ButtonSize>('default');
  /** Icon-only buttons: semantic recoloring of icon + hover border (DS IconButton `tone`) */
  tone = input<ButtonTone>('default');
  type = input<'button' | 'submit'>('button');
  disabled = input<boolean>(false);
  active = input<boolean>(false);
  ariaLabel = input<string>();

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

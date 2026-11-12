import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SideNavItem } from './side-nav.model';
import { L8cIconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';
import { L8cTooltipDirective } from '../tooltip/tooltip.directive';
import {
  arrayInput,
  cssLengthInput,
  numberInput,
  optionalStringInput,
  stringInput,
  type CssLengthInput,
  type NumberInput,
  type StringInput,
} from '../shared/input-validation';

const C = 'l8c-side-nav';

/**
 * Collapsible side navigation rail with optional sub-items per section.
 * Collapsed, a section's children open in a flyout next to the rail;
 * expanded, they render inline while their section is active.
 *
 * The component only emits the selected item key - routing is up to the
 * host app. Template slots (`topTemplate`, `headerTemplate`,
 * `footerTemplate`) take host content such as a product switcher; `top`
 * and `footer` render on both rails and get the collapsed state as their
 * implicit context (`let-collapsed`), `header` only on the expanded rail.
 *
 * An item or sub-item with `helpLink` gets a help link (circle-help) next
 * to its button that opens the page in a new tab - never inside the button,
 * so a click on the link never selects the item. Its accessible name is
 * `<helpLabel>: <item label>`. Help links show on the expanded rail only.
 */
@Component({
  selector: 'l8c-side-nav',
  imports: [NgTemplateOutlet, L8cIconComponent, L8cTooltipDirective],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:mousedown)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class L8cSideNavComponent {
  items = input<SideNavItem[], readonly SideNavItem[] | null | undefined>([], {
    transform: arrayInput(C, 'items'),
  });
  active = input<string | undefined, StringInput>(undefined, {
    transform: optionalStringInput(C, 'active'),
  });
  itemSelected = output<string>();
  collapsedChange = output<boolean>();

  width = input<number, NumberInput>(240, {
    transform: numberInput(C, 'width', 240, { min: 0, integer: true }),
  });
  collapsedWidth = input<number, NumberInput>(68, {
    transform: numberInput(C, 'collapsedWidth', 68, { min: 0, integer: true }),
  });
  /** Distance from the top as a CSS length; a px number gets its unit */
  topOffset = input<number | string, CssLengthInput>('0px', {
    transform: cssLengthInput(C, 'topOffset', '0px'),
  });
  /** `topOffset` as the CSS value for `style.top` */
  topOffsetCss = computed<string>(() => {
    const offset = this.topOffset();
    return typeof offset === 'number' ? `${offset}px` : offset;
  });

  // Labels of the collapse toggle; pass translated values from the host app
  collapseLabel = input<string, StringInput>('Collapse', {
    transform: stringInput(C, 'collapseLabel', 'Collapse'),
  });
  expandLabel = input<string, StringInput>('Expand', {
    transform: stringInput(C, 'expandLabel', 'Expand'),
  });
  /** Tooltip of the help links; their accessible name is `<helpLabel>: <item label>` */
  helpLabel = input<string, StringInput>('Open user guide', {
    transform: stringInput(C, 'helpLabel', 'Open user guide'),
  });

  // Template inputs for slots
  topTemplate = input<TemplateRef<any> | null>(null);
  headerTemplate = input<TemplateRef<any> | null>(null);
  footerTemplate = input<TemplateRef<any> | null>(null);

  collapsed = signal<boolean>(false);
  hoverItem = signal<string | null>(null);
  flyoutItem = signal<string | null>(null);
  flyoutTop = signal<number>(0);

  private elementRef = inject(ElementRef);

  toggleCollapse(): void {
    this.flyoutItem.set(null);
    this.collapsed.update((c) => {
      const newValue = !c;
      this.collapsedChange.emit(newValue);
      return newValue;
    });
  }

  handleNavigate(key: string): void {
    this.flyoutItem.set(null);
    this.itemSelected.emit(key);
  }

  handleItemClick(item: SideNavItem, event: MouseEvent): void {
    if (item.children && item.children.length > 0) {
      // When the rail is collapsed the children live in a flyout next to the
      // rail; expanded, selecting the section navigates to its first child.
      if (this.collapsed()) {
        if (this.flyoutItem() === item.key) {
          this.flyoutItem.set(null);
        } else {
          const target = event.currentTarget as HTMLElement;
          this.flyoutTop.set(target.getBoundingClientRect().top);
          this.flyoutItem.set(item.key);
        }
        return;
      }
      this.handleNavigate(item.children[0].key);
      return;
    }
    this.flyoutItem.set(null);
    this.itemSelected.emit(item.key);
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.flyoutItem() && !this.elementRef.nativeElement.contains(event.target)) {
      this.flyoutItem.set(null);
    }
  }

  onEscapeKey(): void {
    this.flyoutItem.set(null);
  }

  setHoverItem(key: string | null): void {
    this.hoverItem.set(key);
  }

  isActive(key: string): boolean {
    return this.active() === key;
  }

  isSectionActive(item: SideNavItem): boolean {
    const currentActive = this.active();
    if (currentActive === item.key) return true;
    if (item.children) {
      return item.children.some((child) => child.key === currentActive);
    }
    return false;
  }

  isHovered(key: string): boolean {
    return this.hoverItem() === key;
  }

  getIconName(icon: string | undefined): IconName {
    return (icon || 'house') as IconName;
  }

  helpName(label: string): string {
    return `${this.helpLabel()}: ${label}`;
  }
}

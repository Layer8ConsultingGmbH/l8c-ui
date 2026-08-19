import {
  Component,
  ElementRef,
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

/**
 * Collapsible side navigation rail with optional sub-items per section.
 * Collapsed, a section's children open in a flyout next to the rail;
 * expanded, they render inline while their section is active.
 *
 * The component only emits the selected item key - routing is up to the
 * host app. Template slots (`topTemplate`, `headerTemplate`,
 * `footerTemplate`) take host content such as a product switcher.
 */
@Component({
  selector: 'l8c-side-nav',
  imports: [NgTemplateOutlet, L8cIconComponent],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:mousedown)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class L8cSideNavComponent {
  items = input<SideNavItem[]>([]);
  active = input<string>();
  itemSelected = output<string>();
  collapsedChange = output<boolean>();

  width = input<number>(240);
  collapsedWidth = input<number>(68);
  topOffset = input<string>('0px');

  // Labels of the collapse toggle; pass translated values from the host app
  collapseLabel = input<string>('Collapse');
  expandLabel = input<string>('Expand');

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
}

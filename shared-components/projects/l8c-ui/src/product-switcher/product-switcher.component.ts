import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { L8cIconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';
import { PlatformProduct } from './product-switcher.model';

@Component({
  selector: 'l8c-product-switcher',
  imports: [L8cIconComponent],
  templateUrl: './product-switcher.component.html',
  styleUrls: ['./product-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.block]': 'block()',
    '[class.collapsed]': 'collapsed()',
    '(document:mousedown)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class L8cProductSwitcherComponent {
  products = input<PlatformProduct[]>([]);
  active = input<string>();
  collapsed = input<boolean>(false);
  block = input<boolean>(false);
  onSwitch = output<string>();

  open = signal<boolean>(false);

  activeProduct = computed<PlatformProduct>(() => {
    const products = this.products();
    const active = this.active();
    return (
      products.find((p) => p.key === active) ||
      products[0] || { key: 'platform', label: 'Platform' }
    );
  });

  private elementRef = inject(ElementRef);

  toggleMenu(): void {
    this.open.update((o) => !o);
  }

  selectProduct(key: string): void {
    this.open.set(false);
    this.onSwitch.emit(key);
  }

  isActive(key: string): boolean {
    return key === this.activeProduct().key;
  }

  getIconName(icon: string | undefined): IconName {
    return (icon || 'layout-grid') as IconName;
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  onEscapeKey(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }
}

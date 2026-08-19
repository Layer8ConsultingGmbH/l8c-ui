import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

export interface PageChangeEvent {
  page: number;
  size: number;
}

@Component({
  selector: 'l8c-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cPaginationComponent {
  currentPage = input<number>(0);
  totalPages = input<number>(0);
  // Writable input: also set internally when the user picks a new page size
  pageSize = model<number>(2);
  totalItems = input<number>(0);
  maxVisiblePages = input<number>(5);
  showFirstLast = input<boolean>(true);
  showPageInfo = input<boolean>(true);
  showPageSizeSelector = input<boolean>(true);
  pageSizeOptions = input<number[]>([2, 10, 25]);
  pageInfoTemplate = input<string>('Showing {start} to {end} of {total} entries');
  itemsPerPageLabel = input<string>('Items per page:');

  pageChange = output<PageChangeEvent>();

  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const max = this.maxVisiblePages();

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const half = Math.floor(max / 2);
    let start = Math.max(0, current - half);
    let end = Math.min(total - 1, start + max - 1);

    if (end - start < max - 1) {
      start = Math.max(0, end - max + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  canGoPrevious = computed(() => this.currentPage() > 0);
  canGoNext = computed(() => this.currentPage() < this.totalPages() - 1);

  startItem = computed(() => this.currentPage() * this.pageSize() + 1);
  endItem = computed(() => Math.min((this.currentPage() + 1) * this.pageSize(), this.totalItems()));

  pageInfoText = computed(() => {
    return this.pageInfoTemplate()
      .replace('{start}', this.startItem().toString())
      .replace('{end}', this.endItem().toString())
      .replace('{total}', this.totalItems().toString());
  });

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit({ page, size: this.pageSize() });
    }
  }

  goToFirst(): void {
    this.goToPage(0);
  }

  goToLast(): void {
    this.goToPage(this.totalPages() - 1);
  }

  goToPrevious(): void {
    this.goToPage(this.currentPage() - 1);
  }

  goToNext(): void {
    this.goToPage(this.currentPage() + 1);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    if (newSize !== this.pageSize()) {
      this.pageSize.set(newSize);
      this.pageChange.emit({ page: 0, size: newSize });
    }
  }
}

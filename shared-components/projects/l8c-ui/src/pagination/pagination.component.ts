import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import {
  arrayInput,
  booleanInput,
  numberInput,
  stringInput,
  warnInvalidInput,
  type BooleanInput,
  type NumberInput,
  type StringInput,
} from '../shared/input-validation';

const C = 'l8c-pagination';
const DEFAULT_PAGE_SIZE_OPTIONS = [2, 10, 25];
const DEFAULT_PAGE_INFO_TEMPLATE = 'Showing {start} to {end} of {total} entries';

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

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
  currentPage = input<number, NumberInput>(0, {
    transform: numberInput(C, 'currentPage', 0, { min: 0, integer: true }),
  });
  totalPages = input<number, NumberInput>(0, {
    transform: numberInput(C, 'totalPages', 0, { min: 0, integer: true }),
  });
  // Writable input: also set internally when the user picks a new page size.
  // A model has no transform, so read it through `safePageSize`.
  pageSize = model<number>(2);
  totalItems = input<number, NumberInput>(0, {
    transform: numberInput(C, 'totalItems', 0, { min: 0, integer: true }),
  });
  maxVisiblePages = input<number, NumberInput>(5, {
    transform: numberInput(C, 'maxVisiblePages', 5, { min: 1, integer: true }),
  });
  showFirstLast = input<boolean, BooleanInput>(true, {
    transform: booleanInput(C, 'showFirstLast', true),
  });
  showPageInfo = input<boolean, BooleanInput>(true, {
    transform: booleanInput(C, 'showPageInfo', true),
  });
  showPageSizeSelector = input<boolean, BooleanInput>(true, {
    transform: booleanInput(C, 'showPageSizeSelector', true),
  });
  pageSizeOptions = input<number[], readonly number[] | null | undefined>(
    DEFAULT_PAGE_SIZE_OPTIONS,
    { transform: arrayInput(C, 'pageSizeOptions') },
  );
  pageInfoTemplate = input<string, StringInput>(DEFAULT_PAGE_INFO_TEMPLATE, {
    transform: stringInput(C, 'pageInfoTemplate', DEFAULT_PAGE_INFO_TEMPLATE),
  });
  itemsPerPageLabel = input<string, StringInput>('Items per page:', {
    transform: stringInput(C, 'itemsPerPageLabel', 'Items per page:'),
  });

  pageChange = output<PageChangeEvent>();

  /** `pageSize` as a positive integer; anything else reads as 1 */
  safePageSize = computed<number>(() => {
    const size = this.pageSize();
    if (isPositiveInteger(size)) {
      return size;
    }
    warnInvalidInput(C, 'pageSize', size, 'expected a positive integer, using 1');
    return 1;
  });

  /** `pageSizeOptions` reduced to positive integers; invalid entries are dropped */
  validPageSizeOptions = computed<number[]>(() => {
    const options = this.pageSizeOptions();
    const valid = options.filter(isPositiveInteger);
    if (valid.length !== options.length) {
      warnInvalidInput(
        C,
        'pageSizeOptions',
        options,
        'dropped entries that are no positive integer',
      );
    }
    return valid;
  });

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

  startItem = computed(() => this.currentPage() * this.safePageSize() + 1);
  endItem = computed(() =>
    Math.min((this.currentPage() + 1) * this.safePageSize(), this.totalItems()),
  );

  pageInfoText = computed(() => {
    return this.pageInfoTemplate()
      .replace('{start}', this.startItem().toString())
      .replace('{end}', this.endItem().toString())
      .replace('{total}', this.totalItems().toString());
  });

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit({ page, size: this.safePageSize() });
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
    if (!isPositiveInteger(newSize)) {
      return;
    }
    if (newSize !== this.safePageSize()) {
      this.pageSize.set(newSize);
      this.pageChange.emit({ page: 0, size: newSize });
    }
  }
}

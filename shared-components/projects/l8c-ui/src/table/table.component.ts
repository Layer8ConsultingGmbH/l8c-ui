import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { L8cPaginationComponent, PageChangeEvent } from '../pagination/pagination.component';
import { L8cButtonComponent } from '../button/button.component';
import { L8cIconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';

export type CellType = 'text' | 'number' | 'status' | 'action' | 'textCopy';
export type ColumnSort = 'none' | 'asc' | 'desc';
export type StatusTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error';

// Status → tone mapping per Layer8 Design System v0.2 (components/data/StatusBadge).
// Unknown values fall back to neutral.
const STATUS_TONES: Record<string, StatusTone> = {
  // ready / open / active
  ready: 'primary',
  open: 'primary',
  sent: 'primary',
  active: 'primary',
  // success / done
  completed: 'success',
  done: 'success',
  valid: 'success',
  approved: 'success',
  submitted: 'success',
  resubmitted: 'success',
  // draft / pending / neutral
  draft: 'neutral',
  pending: 'warning',
  'in progress': 'warning',
  review: 'warning',
  'in review': 'warning',
  'changes requested': 'warning',
  // archived / inactive / n-a
  archived: 'neutral',
  inactive: 'neutral',
  closed: 'neutral',
  // error
  failed: 'error',
  error: 'error',
  overdue: 'error',
  expired: 'error',
};

/** Small pill rendered before a text cell value (e.g. a "scheduled" hint) */
export interface CellBadge {
  label: string;
  icon?: IconName;
  /** Tooltip explaining the badge */
  title?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  subtitle?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
  cellType?: CellType;
  sortable?: boolean;
  filterable?: boolean;
  /** Muted icon rendered before the cell value of text cells (e.g. user vs. group) */
  icon?: (row: any) => IconName | null;
  /** Tooltip for the cell icon */
  iconLabel?: (row: any) => string;
  /** Pill badge rendered before the cell value of text cells */
  badge?: (row: any) => CellBadge | null;
}

export interface PageableData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

@Component({
  selector: 'l8c-table',
  imports: [NgTemplateOutlet, L8cPaginationComponent, L8cButtonComponent, L8cIconComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cTableComponent<T = any> {
  columns = input.required<TableColumn[]>();
  data = input<T[]>([]);
  striped = input<boolean>(false);
  hoverable = input<boolean>(true);
  bordered = input<boolean>(true);
  compact = input<boolean>(false);
  showPagination = input<boolean>(false);
  pageableData = input<PageableData<T> | undefined>(undefined);
  paginationItemsPerPageLabel = input<string>('Items per page:');
  paginationShowingEntriesTemplate = input<string>('Showing {start} to {end} of {total} entries');

  rowClicked = output<T>();
  pageChanged = output<PageChangeEvent>();
  sortChanged = output<{ column: string; direction: ColumnSort }>();
  filterChanged = output<{ column: string; value: string }>();

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<any>;
  @ContentChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  protected sortState = signal<Record<string, ColumnSort>>({});
  protected filterValues = signal<Record<string, string>>({});

  displayData = computed<T[]>(() => {
    const pageable = this.pageableData();
    return pageable ? pageable.items : this.data();
  });

  onRowClick(row: T): void {
    this.rowClicked.emit(row);
  }

  onPageChange(event: PageChangeEvent): void {
    this.pageChanged.emit(event);
  }

  getValue(row: T, column: TableColumn): any {
    const value = (row as any)[column.key];
    return column.formatter ? column.formatter(value) : value;
  }

  getCellIcon(row: T, column: TableColumn): IconName | null {
    return column.icon ? column.icon(row) : null;
  }

  getCellIconLabel(row: T, column: TableColumn): string {
    return column.iconLabel ? column.iconLabel(row) : '';
  }

  getCellBadge(row: T, column: TableColumn): CellBadge | null {
    return column.badge ? column.badge(row) : null;
  }

  getCellType(column: TableColumn): CellType {
    return column.cellType || 'text';
  }

  getStatusTone(value: any): StatusTone {
    return STATUS_TONES[String(value ?? '').toLowerCase()] || 'neutral';
  }

  toggleSort(column: TableColumn): void {
    if (!column.sortable) return;

    const currentSort = this.sortState()[column.key] || 'none';
    const newSort: ColumnSort =
      currentSort === 'none' ? 'asc' : currentSort === 'asc' ? 'desc' : 'none';

    this.sortState.update(() => ({ [column.key]: newSort }));
    this.sortChanged.emit({ column: column.key, direction: newSort });
  }

  getSortState(column: TableColumn): ColumnSort {
    return this.sortState()[column.key] || 'none';
  }

  onFilterInput(column: TableColumn, value: string): void {
    this.filterValues.update((currentFilters) => ({
      ...currentFilters,
      [column.key]: value,
    }));
    this.filterChanged.emit({ column: column.key, value });
  }

  clearFilter(column: TableColumn): void {
    this.filterValues.update((currentFilters) => {
      const newFilters = { ...currentFilters };
      delete newFilters[column.key];
      return newFilters;
    });
    this.filterChanged.emit({ column: column.key, value: '' });
  }

  getFilterValue(column: TableColumn): string {
    return this.filterValues()[column.key] || '';
  }

  trackByFn(index: number, row: T): any {
    // Use row.id if available for stable tracking, otherwise fall back to index
    return (row as any)?.id ?? index;
  }
}

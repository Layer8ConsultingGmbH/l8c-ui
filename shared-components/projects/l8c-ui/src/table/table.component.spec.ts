import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cTableComponent, TableColumn, PageableData } from './table.component';

describe('L8cTableComponent', () => {
  let component: L8cTableComponent;
  let fixture: ComponentFixture<L8cTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render table with columns', () => {
    const columns: TableColumn[] = [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ];

    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent.trim()).toBe('Name');
    expect(headers[1].textContent.trim()).toBe('Age');
  });

  it('should render table with data', () => {
    const columns: TableColumn[] = [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ];
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should emit rowClicked event when row is clicked', () => {
    const columns: TableColumn[] = [{ key: 'name', label: 'Name' }];
    const data = [{ name: 'John' }];

    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();

    let emittedRow: any;
    component.rowClicked.subscribe((row) => {
      emittedRow = row;
    });

    const row = fixture.nativeElement.querySelector('tbody tr');
    row.click();

    expect(emittedRow).toEqual({ name: 'John' });
  });

  it('should render a no-data row when the data is empty', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ]);
    fixture.detectChanges();

    const emptyRow = fixture.nativeElement.querySelector('.no-data-row td');
    expect(emptyRow).toBeTruthy();
    expect(emptyRow.getAttribute('colspan')).toBe('2');
  });

  it('should apply the column formatter', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'price', label: 'Price', formatter: (value: number) => `${value} EUR` },
    ]);
    fixture.componentRef.setInput('data', [{ price: 10 }]);
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('tbody td');
    expect(cell.textContent.trim()).toBe('10 EUR');
  });

  it('should render status cells with the mapped tone', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'status', label: 'Status', cellType: 'status' },
    ]);
    fixture.componentRef.setInput('data', [
      { status: 'Completed' },
      { status: 'Failed' },
      { status: 'something unknown' },
    ]);
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('.status-badge');
    expect(badges[0].getAttribute('data-tone')).toBe('success');
    expect(badges[1].getAttribute('data-tone')).toBe('error');
    expect(badges[2].getAttribute('data-tone')).toBe('neutral');
  });

  it('should render a copy button for textCopy cells', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'link', label: 'Link', cellType: 'textCopy' },
    ]);
    fixture.componentRef.setInput('data', [{ link: 'https://example.com' }]);
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('.text-copy-cell');
    expect(cell.textContent).toContain('https://example.com');
    expect(cell.querySelector('l8c-button')).toBeTruthy();
  });

  describe('sorting', () => {
    const sortableColumns: TableColumn[] = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age', sortable: true },
    ];

    beforeEach(() => {
      fixture.componentRef.setInput('columns', sortableColumns);
      fixture.componentRef.setInput('data', [{ name: 'John', age: 30 }]);
      fixture.detectChanges();
    });

    it('should cycle the sort direction none -> asc -> desc -> none', () => {
      const emitted: { column: string; direction: string }[] = [];
      component.sortChanged.subscribe((event) => emitted.push(event));
      const sortButton = fixture.nativeElement.querySelector('.sort-button');

      sortButton.click();
      sortButton.click();
      sortButton.click();

      expect(emitted).toEqual([
        { column: 'name', direction: 'asc' },
        { column: 'name', direction: 'desc' },
        { column: 'name', direction: 'none' },
      ]);
    });

    it('should keep only one column sorted at a time', () => {
      component.toggleSort(sortableColumns[0]);
      expect(component.getSortState(sortableColumns[0])).toBe('asc');

      component.toggleSort(sortableColumns[1]);

      expect(component.getSortState(sortableColumns[1])).toBe('asc');
      expect(component.getSortState(sortableColumns[0])).toBe('none');
    });

    it('should ignore toggleSort on non-sortable columns', () => {
      let emitted = false;
      component.sortChanged.subscribe(() => (emitted = true));

      component.toggleSort({ key: 'other', label: 'Other' });

      expect(emitted).toBe(false);
    });
  });

  describe('filtering', () => {
    const filterableColumn: TableColumn = { key: 'name', label: 'Name', filterable: true };

    beforeEach(() => {
      fixture.componentRef.setInput('columns', [filterableColumn]);
      fixture.componentRef.setInput('data', [{ name: 'John' }]);
      fixture.detectChanges();
    });

    it('should emit filterChanged on filter input', () => {
      const emitted: { column: string; value: string }[] = [];
      component.filterChanged.subscribe((event) => emitted.push(event));

      const input: HTMLInputElement = fixture.nativeElement.querySelector('.filter-input');
      input.value = 'jo';
      input.dispatchEvent(new Event('input'));

      expect(emitted).toEqual([{ column: 'name', value: 'jo' }]);
      expect(component.getFilterValue(filterableColumn)).toBe('jo');
    });

    it('should clear the filter and emit an empty value', () => {
      component.onFilterInput(filterableColumn, 'jo');
      const emitted: { column: string; value: string }[] = [];
      component.filterChanged.subscribe((event) => emitted.push(event));

      fixture.nativeElement.querySelector('.filter-clear-button').click();

      expect(emitted).toEqual([{ column: 'name', value: '' }]);
      expect(component.getFilterValue(filterableColumn)).toBe('');
    });
  });

  describe('pagination', () => {
    const pageable: PageableData<{ name: string }> = {
      items: [{ name: 'John' }, { name: 'Jane' }],
      total: 12,
      page: 0,
      size: 2,
      pages: 6,
    };

    beforeEach(() => {
      fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Name' }]);
      fixture.componentRef.setInput('showPagination', true);
      fixture.componentRef.setInput('pageableData', pageable);
      fixture.detectChanges();
    });

    it('should display the items of the pageable data', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
      expect(fixture.nativeElement.querySelector('l8c-pagination')).toBeTruthy();
    });

    it('should forward pageChange events from the pagination', () => {
      let emitted: { page: number; size: number } | undefined;
      component.pageChanged.subscribe((event) => (emitted = event));

      const nextButton = fixture.nativeElement.querySelector('[aria-label="Next page"]');
      nextButton.click();

      expect(emitted).toEqual({ page: 1, size: 2 });
    });
  });
});

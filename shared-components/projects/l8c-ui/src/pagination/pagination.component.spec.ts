import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cPaginationComponent, PageChangeEvent } from './pagination.component';

describe('L8cPaginationComponent', () => {
  let component: L8cPaginationComponent;
  let fixture: ComponentFixture<L8cPaginationComponent>;
  let events: PageChangeEvent[];

  function pageButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.pagination-btn')).filter((btn) =>
      /^\d+$/.test((btn as HTMLButtonElement).textContent!.trim()),
    ) as HTMLButtonElement[];
  }

  function navButton(label: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(`[aria-label="${label}"]`);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cPaginationComponent);
    component = fixture.componentInstance;
    events = [];
    component.pageChange.subscribe((event) => events.push(event));
    fixture.componentRef.setInput('currentPage', 0);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('totalItems', 30);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one button per page when all pages fit', () => {
    const buttons = pageButtons();
    expect(buttons.length).toBe(3);
    expect(buttons[0].classList.contains('active')).toBe(true);
    expect(buttons[0].getAttribute('aria-current')).toBe('page');
  });

  it('should window the visible pages around the current page', () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 10);
    fixture.detectChanges();

    expect(component.visiblePages()).toEqual([8, 9, 10, 11, 12]);
  });

  it('should clamp the window at the end of the page range', () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 19);
    fixture.detectChanges();

    expect(component.visiblePages()).toEqual([15, 16, 17, 18, 19]);
  });

  it('should show the page info text with start, end and total', () => {
    const info = fixture.nativeElement.querySelector('.page-info');
    expect(info.textContent.trim()).toBe('Showing 1 to 10 of 30 entries');
  });

  it('should cap the end item at the total item count', () => {
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('totalItems', 25);
    fixture.detectChanges();

    expect(component.endItem()).toBe(25);
  });

  it('should emit pageChange when another page is clicked', () => {
    pageButtons()[2].click();

    expect(events).toEqual([{ page: 2, size: 10 }]);
  });

  it('should not emit when the current page is clicked', () => {
    pageButtons()[0].click();

    expect(events).toEqual([]);
  });

  it('should disable previous/first on the first page and navigate next/last', () => {
    expect(navButton('Previous page').disabled).toBe(true);
    expect(navButton('First page').disabled).toBe(true);

    navButton('Next page').click();
    navButton('Last page').click();

    expect(events).toEqual([
      { page: 1, size: 10 },
      { page: 2, size: 10 },
    ]);
  });

  it('should disable next/last on the last page and navigate previous/first', () => {
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();

    expect(navButton('Next page').disabled).toBe(true);
    expect(navButton('Last page').disabled).toBe(true);

    navButton('Previous page').click();
    navButton('First page').click();

    expect(events).toEqual([
      { page: 1, size: 10 },
      { page: 0, size: 10 },
    ]);
  });

  it('should hide first/last buttons when showFirstLast is false', () => {
    fixture.componentRef.setInput('showFirstLast', false);
    fixture.detectChanges();

    expect(navButton('First page')).toBeNull();
    expect(navButton('Last page')).toBeNull();
  });

  it('should hide the page info when disabled or empty', () => {
    fixture.componentRef.setInput('showPageInfo', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-info')).toBeNull();

    fixture.componentRef.setInput('showPageInfo', true);
    fixture.componentRef.setInput('totalItems', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-info')).toBeNull();
  });

  it('should emit page 0 with the new size when the page size changes', () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('.page-size-select');
    select.value = '25';
    select.dispatchEvent(new Event('change'));

    expect(component.pageSize()).toBe(25);
    expect(events).toEqual([{ page: 0, size: 25 }]);
  });

  it('should not emit when the same page size is re-selected', () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('.page-size-select');
    select.value = '10';
    select.dispatchEvent(new Event('change'));

    expect(events).toEqual([]);
  });
});

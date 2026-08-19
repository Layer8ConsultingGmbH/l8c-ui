import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cSearchFieldComponent } from './search-field.component';

describe('L8cSearchFieldComponent', () => {
  let component: L8cSearchFieldComponent<string>;
  let fixture: ComponentFixture<L8cSearchFieldComponent<string>>;

  function typeQuery(value: string) {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cSearchFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cSearchFieldComponent<string>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Search users...');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.placeholder).toBe('Search users...');
  });

  it('should emit searchQueryChange on input', () => {
    let emitted: string | undefined;
    component.searchQueryChange.subscribe((query) => (emitted = query));

    typeQuery('anna');

    expect(emitted).toBe('anna');
    expect(component.queryValue()).toBe('anna');
  });

  it('should render results while a query is active', () => {
    fixture.componentRef.setInput('results', ['Anna', 'Annika']);
    typeQuery('ann');

    const dropdown = fixture.nativeElement.querySelector('.results-dropdown');
    const items = fixture.nativeElement.querySelectorAll('.result-item');
    expect(dropdown.hidden).toBe(false);
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Anna');
  });

  it('should hide the results dropdown without a query', () => {
    fixture.componentRef.setInput('results', ['Anna']);
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('.results-dropdown');
    expect(dropdown.hidden).toBe(true);
  });

  it('should emit resultSelected and clear the query on click', () => {
    let selected: string | undefined;
    component.resultSelected.subscribe((result) => (selected = result));
    fixture.componentRef.setInput('results', ['Anna']);
    typeQuery('ann');

    fixture.nativeElement.querySelector('.result-item').click();
    fixture.detectChanges();

    expect(selected).toBe('Anna');
    expect(component.queryValue()).toBe('');
  });

  it('should show the no-results hint when a query has no matches', () => {
    fixture.componentRef.setInput('results', []);
    fixture.componentRef.setInput('noResultsText', 'Nothing found');
    typeQuery('zzz');

    const noResults = fixture.nativeElement.querySelector('.no-results');
    expect(noResults.hidden).toBe(false);
    expect(noResults.textContent).toContain('Nothing found');
  });

  it('should show the loader and disable the input while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(fixture.nativeElement.querySelector('.loader')).toBeTruthy();
    expect(input.disabled).toBe(true);
  });

  it('should disable the input via the disabled input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });
});

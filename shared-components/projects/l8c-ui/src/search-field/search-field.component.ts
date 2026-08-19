import {
  Component,
  TemplateRef,
  ContentChild,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'l8c-search-field',
  imports: [NgTemplateOutlet],
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cSearchFieldComponent<T = any> {
  readonly loading = input<boolean>(false);
  readonly results = input<T[]>([]);
  readonly placeholder = input<string>('Search...');
  readonly disabled = input<boolean>(false);
  readonly noResultsText = input<string>('No results found');
  readonly noResultsHint = input<string>('Try a different search term');

  @ContentChild('resultItem') resultItemTemplate?: TemplateRef<any>;

  readonly searchQueryChange = output<string>();
  readonly resultSelected = output<T>();

  readonly queryValue = signal('');

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.queryValue.set(target.value);
    this.searchQueryChange.emit(target.value);
  }

  onResultClick(result: T): void {
    this.resultSelected.emit(result);
    this.queryValue.set('');
  }
}

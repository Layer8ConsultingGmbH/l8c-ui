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
import {
  arrayInput,
  booleanInput,
  stringInput,
  type BooleanInput,
  type StringInput,
} from '../shared/input-validation';

const C = 'l8c-search-field';

@Component({
  selector: 'l8c-search-field',
  imports: [NgTemplateOutlet],
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cSearchFieldComponent<T = any> {
  readonly loading = input<boolean, BooleanInput>(false, { transform: booleanInput(C, 'loading') });
  readonly results = input<T[], readonly T[] | null | undefined>([], {
    transform: arrayInput<T>(C, 'results'),
  });
  readonly placeholder = input<string, StringInput>('Search...', {
    transform: stringInput(C, 'placeholder', 'Search...'),
  });
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanInput(C, 'disabled'),
  });
  readonly noResultsText = input<string, StringInput>('No results found', {
    transform: stringInput(C, 'noResultsText', 'No results found'),
  });
  readonly noResultsHint = input<string, StringInput>('Try a different search term', {
    transform: stringInput(C, 'noResultsHint', 'Try a different search term'),
  });

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

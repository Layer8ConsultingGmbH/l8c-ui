import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from './date-format';

/** `{{ iso | l8cFormatDate: 'de' }}` renders "07 Mär 2026" */
@Pipe({ name: 'l8cFormatDate' })
export class L8cFormatDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, lang?: string | null): string {
    return formatDate(value, lang);
  }
}

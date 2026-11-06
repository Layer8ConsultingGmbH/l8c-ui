import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileInputItem, L8cFileInputComponent, formatFileSize } from './file-input.component';

@Component({
  imports: [L8cFileInputComponent],
  template: `
    <l8c-file-input
      [variant]="variant()"
      [accept]="'.csv,text/csv'"
      [files]="files()"
      [label]="'Questions (CSV)'"
      [buttonLabel]="'Datei wählen'"
      [dropLabel]="'CSV hierher ziehen oder'"
      [removeLabel]="'Entfernen'"
      [buttonAction]="'nav'"
      (filesChange)="chosen.set($event)"
    />
  `,
})
class HostComponent {
  variant = signal<'dropzone' | 'button'>('dropzone');
  files = signal<FileInputItem[]>([]);
  chosen = signal<File[] | null>(null);
}

describe('L8cFileInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const native = (): HTMLInputElement => fixture.nativeElement.querySelector('input[type="file"]');
  const buttons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.choose-button button'));
  const csv = (name = 'questions.csv') => new File(['questionText'], name, { type: 'text/csv' });

  /** jsdom has no DataTransfer, so a FileList is faked as an array-like */
  function fileList(...files: File[]): FileList {
    return Object.assign([...files], {
      item: (index: number) => files[index] ?? null,
    }) as unknown as FileList;
  }

  function chooseNative(...files: File[]): void {
    Object.defineProperty(native(), 'files', { value: fileList(...files), configurable: true });
    native().dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the drop zone with the label and texts and a hidden native input', () => {
    expect(native().hidden).toBe(true);
    expect(native().getAttribute('accept')).toBe('.csv,text/csv');
    expect(fixture.nativeElement.querySelector('.file-label').textContent.trim()).toBe(
      'Questions (CSV)',
    );
    expect(fixture.nativeElement.querySelector('.dropzone-text').textContent.trim()).toBe(
      'CSV hierher ziehen oder',
    );
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Datei wählen']);
  });

  it('opens the file dialog from the button and reports the chosen file', () => {
    const click = vi.spyOn(native(), 'click');
    buttons()[0].click();
    expect(click).toHaveBeenCalled();

    chooseNative(csv(), csv('second.csv'));

    // One file unless multiple
    expect(host.chosen()?.map((f) => f.name)).toEqual(['questions.csv']);
    expect(native().value).toBe('');
  });

  it('lists the chosen files with size and removes one on request', () => {
    host.files.set([
      { name: 'questions.csv', size: 2048 },
      { name: 'more.csv', size: 3 * 1024 * 1024 },
    ]);
    fixture.detectChanges();

    const items = Array.from(fixture.nativeElement.querySelectorAll('.file-item')) as HTMLElement[];
    expect(items.map((item) => item.querySelector('.file-name')?.textContent?.trim())).toEqual([
      'questions.csv',
      'more.csv',
    ]);
    expect(items.map((item) => item.querySelector('.file-size')?.textContent?.trim())).toEqual([
      '2 KB',
      '3.0 MB',
    ]);
    const remove = items[0].querySelector('.remove-button') as HTMLButtonElement;
    expect(remove.getAttribute('aria-label')).toBe('Entfernen: questions.csv');

    remove.click();
    fixture.detectChanges();
    // Plain items are not File objects, so nothing is left to hand back
    expect(host.chosen()).toEqual([]);
  });

  it('takes a dropped file and marks the drag', () => {
    const zone: HTMLElement = fixture.nativeElement.querySelector('.dropzone');
    zone.dispatchEvent(new Event('dragover', { cancelable: true }));
    fixture.detectChanges();
    expect(zone.classList.contains('dragging')).toBe(true);

    const drop = new Event('drop', { cancelable: true }) as DragEvent;
    Object.defineProperty(drop, 'dataTransfer', { value: { files: fileList(csv('dropped.csv')) } });
    zone.dispatchEvent(drop);
    fixture.detectChanges();

    expect(zone.classList.contains('dragging')).toBe(false);
    expect(host.chosen()?.map((f) => f.name)).toEqual(['dropped.csv']);
  });

  it('renders only a button in the button variant', () => {
    host.variant.set('button');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dropzone')).toBeNull();
    expect(buttons().length).toBe(1);
    expect(buttons()[0].classList.contains('btn-nav')).toBe(true);
    expect(buttons()[0].querySelector('svg')).toBeTruthy();
    expect(native()).toBeTruthy();
  });

  it('formats file sizes', () => {
    expect(formatFileSize(10)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('2 KB');
    expect(formatFileSize(1.25 * 1024 * 1024)).toBe('1.3 MB');
  });
});

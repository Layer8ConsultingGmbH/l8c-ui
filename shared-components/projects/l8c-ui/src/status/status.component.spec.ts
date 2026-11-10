import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cStatusComponent } from './status.component';
import { StatusTone } from '../table/table.component';

@Component({
  imports: [L8cStatusComponent],
  template: `<l8c-status [status]="status()" [tone]="tone()" />`,
})
class HostComponent {
  status = signal('Draft');
  tone = signal<StatusTone | null>(null);
}

describe('L8cStatusComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const badge = (): HTMLElement => fixture.nativeElement.querySelector('.status-badge');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the status text with a tone dot', () => {
    expect(badge().textContent?.trim()).toBe('Draft');
    expect(badge().querySelector('.status-dot')).toBeTruthy();
  });

  it('marks workflow statuses with data-status and no tone', () => {
    expect(badge().getAttribute('data-status')).toBe('draft');
    expect(badge().hasAttribute('data-tone')).toBe(false);

    host.status.set('In Progress');
    fixture.detectChanges();
    expect(badge().getAttribute('data-status')).toBe('in-progress');
  });

  it('maps other known statuses to a tone', () => {
    const expected: Record<string, StatusTone> = {
      Scheduled: 'primary',
      Approved: 'success',
      Pending: 'warning',
      Overdue: 'error',
      Inactive: 'neutral',
    };
    for (const [status, tone] of Object.entries(expected)) {
      host.status.set(status);
      fixture.detectChanges();
      expect(badge().getAttribute('data-tone'), status).toBe(tone);
      expect(badge().hasAttribute('data-status')).toBe(false);
    }
  });

  it('falls back to neutral for unknown statuses', () => {
    host.status.set('Something else');
    fixture.detectChanges();
    expect(badge().getAttribute('data-tone')).toBe('neutral');
  });

  it('prefers an explicit tone over the status mapping', () => {
    host.status.set('Ready');
    host.tone.set('warning');
    fixture.detectChanges();
    expect(badge().getAttribute('data-tone')).toBe('warning');
    expect(badge().hasAttribute('data-status')).toBe(false);
  });

  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    let plain: ComponentFixture<L8cStatusComponent>;

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      plain = TestBed.createComponent(L8cStatusComponent);
      plain.componentRef.setInput('status', 'Ready');
      plain.detectChanges();
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('ignores an unknown tone, keeps the status mapping and warns', () => {
      plain.componentRef.setInput('tone', 'purple' as unknown as StatusTone);
      plain.detectChanges();

      expect(plain.componentInstance.tone()).toBeNull();
      expect(plain.nativeElement.querySelector('.status-badge').getAttribute('data-status')).toBe(
        'ready',
      );
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('reads a null status as an empty neutral chip and stringifies numbers', () => {
      plain.componentRef.setInput('status', null as unknown as string);
      plain.detectChanges();
      expect(plain.nativeElement.querySelector('.status-badge').getAttribute('data-tone')).toBe(
        'neutral',
      );

      plain.componentRef.setInput('status', 404 as unknown as string);
      plain.detectChanges();
      expect(plain.nativeElement.querySelector('.status-badge').textContent.trim()).toBe('404');
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

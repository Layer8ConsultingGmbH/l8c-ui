import { TestBed } from '@angular/core/testing';
import { DEFAULT_TOAST_DURATION, L8cToastService } from './toast.service';

describe('L8cToastService', () => {
  let service: L8cToastService;

  const messages = (): string[] => service.toasts().map((toast) => toast.message);

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(L8cToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('closes info and success toasts after the default duration of 2.6 seconds', () => {
    expect(DEFAULT_TOAST_DURATION).toBe(2600);
    service.info('Applied');
    service.success('Saved');

    vi.advanceTimersByTime(2599);
    expect(messages()).toEqual(['Applied', 'Saved']);

    vi.advanceTimersByTime(1);
    expect(messages()).toEqual([]);
  });

  it('keeps a toast for the duration of its call', () => {
    service.info('Longer hint', 5000);

    vi.advanceTimersByTime(2600);
    expect(messages()).toEqual(['Longer hint']);

    vi.advanceTimersByTime(2400);
    expect(messages()).toEqual([]);
  });

  it('keeps error toasts until they are dismissed', () => {
    service.error('Not saved');

    vi.advanceTimersByTime(60_000);
    expect(service.toasts()).toEqual([
      { id: expect.any(Number), tone: 'error', message: 'Not saved' },
    ]);

    service.dismiss(service.toasts()[0].id);
    expect(messages()).toEqual([]);
  });

  it('stacks toasts in the order they appeared, each with its own duration', () => {
    service.success('First');
    vi.advanceTimersByTime(1000);
    service.error('Second');
    service.success('Third');

    expect(messages()).toEqual(['First', 'Second', 'Third']);

    vi.advanceTimersByTime(1600);
    expect(messages()).toEqual(['Second', 'Third']);

    vi.advanceTimersByTime(1000);
    expect(messages()).toEqual(['Second']);
  });

  it('dismisses a timed toast early without affecting the others', () => {
    service.success('First');
    service.success('Second');

    service.dismiss(service.toasts()[0].id);
    expect(messages()).toEqual(['Second']);

    vi.advanceTimersByTime(DEFAULT_TOAST_DURATION);
    expect(messages()).toEqual([]);
  });

  it('takes the configured duration for info and success toasts', () => {
    service.setDuration(1000);
    service.success('Saved');
    service.info('Applied');
    service.info('Own duration', 4000);

    vi.advanceTimersByTime(999);
    expect(messages()).toEqual(['Saved', 'Applied', 'Own duration']);
    vi.advanceTimersByTime(1);
    expect(messages()).toEqual(['Own duration']);
  });

  it.each([undefined, null, 0, -5, Number.NaN, '1000'])(
    'keeps the default duration for the configured value %s',
    (value) => {
      service.setDuration(value);
      service.success('Saved');

      vi.advanceTimersByTime(DEFAULT_TOAST_DURATION - 1);
      expect(messages()).toEqual(['Saved']);
      vi.advanceTimersByTime(1);
      expect(messages()).toEqual([]);
    },
  );
});

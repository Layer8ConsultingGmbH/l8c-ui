import { Injectable, signal } from '@angular/core';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

/**
 * How long info and success toasts stay, in milliseconds (value from the
 * design system). Change it per app with `setDuration()` or per call.
 */
export const DEFAULT_TOAST_DURATION = 2600;

/**
 * Short feedback after an action, shown by `l8c-toast-container`. Info and
 * success toasts disappear after their duration; error toasts stay until
 * the user dismisses them, so they cannot vanish unread.
 *
 * Messages are finished strings - pass translated values from the host app.
 */
@Injectable({ providedIn: 'root' })
export class L8cToastService {
  private readonly items = signal<ToastItem[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;
  private duration = DEFAULT_TOAST_DURATION;

  /** The visible toasts, oldest first */
  readonly toasts = this.items.asReadonly();

  /**
   * Sets the duration of info and success toasts, e.g. from the app's
   * runtime configuration. Anything but a positive number keeps the default.
   */
  setDuration(milliseconds: unknown): void {
    this.duration =
      typeof milliseconds === 'number' && Number.isFinite(milliseconds) && milliseconds > 0
        ? milliseconds
        : DEFAULT_TOAST_DURATION;
  }

  info(message: string, duration = this.duration): void {
    this.show('info', message, duration);
  }

  success(message: string, duration = this.duration): void {
    this.show('success', message, duration);
  }

  /** Stays until dismissed */
  error(message: string): void {
    this.show('error', message, null);
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  private show(tone: ToastTone, message: string, duration: number | null): void {
    const id = this.nextId++;
    this.items.update((items) => [...items, { id, tone, message }]);
    if (duration !== null) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }
  }
}

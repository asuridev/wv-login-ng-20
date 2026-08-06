import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';

import { ToastStore } from '../../core/store/toast.store';
import { Toast } from '../ui/toast';

/** Milisegundos que un toast permanece visible antes de auto-cerrarse. */
export const TOAST_TIMEOUT_MS = 5000;

/**
 * Pila global de notificaciones, montada una sola vez en `app.ts`. Agenda el
 * auto-cierre de cada toast; el store se mantiene como estado puro.
 */
@Component({
  selector: 'toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Toast],
  host: {
    class:
      'pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4',
  },
  template: `
    @for (toast of toastStore.toasts(); track toast.id) {
      <ui-toast
        class="transition-all duration-200 starting:-translate-y-2 starting:opacity-0"
        [variant]="toast.variant"
        [title]="toast.title"
        [message]="toast.message"
        (closed)="toastStore.dismiss(toast.id)"
      />
    }
  `,
})
export class ToastContainer {
  protected readonly toastStore = inject(ToastStore);

  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor() {
    effect(() => {
      const visible = this.toastStore.toasts();

      for (const { id } of visible) {
        if (this.timers.has(id)) continue;
        this.timers.set(
          id,
          setTimeout(() => {
            this.timers.delete(id);
            this.toastStore.dismiss(id);
          }, TOAST_TIMEOUT_MS)
        );
      }

      // Un toast cerrado a mano deja su timer huérfano: hay que cancelarlo.
      const visibleIds = new Set(visible.map(({ id }) => id));
      for (const [id, timer] of this.timers) {
        if (visibleIds.has(id)) continue;
        clearTimeout(timer);
        this.timers.delete(id);
      }
    });

    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers.values()) clearTimeout(timer);
      this.timers.clear();
    });
  }
}

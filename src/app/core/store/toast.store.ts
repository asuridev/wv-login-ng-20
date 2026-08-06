import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export type ToastVariant = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  message: string;
}

/**
 * Estado transversal sin feature dueño: cola de notificaciones globales.
 * Es estado puro y síncrono — el auto-cierre lo agenda `ToastContainer`,
 * no el store.
 */
export const ToastStore = signalStore(
  { providedIn: 'root' },
  withState({ toasts: [] as Toast[], lastId: 0 }),
  withMethods((store) => {
    const show = (variant: ToastVariant, title: string, message: string): number => {
      const id = store.lastId() + 1;
      patchState(store, {
        lastId: id,
        toasts: [...store.toasts(), { id, variant, title, message }],
      });
      return id;
    };

    return {
      show,
      error: (title: string, message: string): number => show('error', title, message),
      success: (title: string, message: string): number => show('success', title, message),
      info: (title: string, message: string): number => show('info', title, message),
      dismiss(id: number): void {
        patchState(store, { toasts: store.toasts().filter((toast) => toast.id !== id) });
      },
      clear(): void {
        patchState(store, { toasts: [] });
      },
    };
  })
);

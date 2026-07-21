import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

/** Estado transversal sin feature dueño: indicador de carga global. */
export const AppStore = signalStore(
  { providedIn: 'root' },
  withState({ pendingRequests: 0 }),
  withComputed(({ pendingRequests }) => ({
    isLoading: computed(() => pendingRequests() > 0),
  })),
  withMethods((store) => ({
    showLoading(): void {
      patchState(store, { pendingRequests: store.pendingRequests() + 1 });
    },
    hideLoading(): void {
      patchState(store, { pendingRequests: Math.max(0, store.pendingRequests() - 1) });
    },
  }))
);

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { AppStore } from '../store/app.store';

/** Lleva la cuenta de peticiones en curso para el indicador de carga global. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const appStore = inject(AppStore);

  appStore.showLoading();
  return next(req).pipe(finalize(() => appStore.hideLoading()));
};

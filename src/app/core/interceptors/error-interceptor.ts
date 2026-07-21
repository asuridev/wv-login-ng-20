import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { catchError, throwError } from 'rxjs';

export interface ApiError {
  status: number;
  message: string;
  url: string | null;
}

const normalizeApiError = (error: HttpErrorResponse): ApiError => ({
  status: error.status,
  message: error.error?.message ?? error.message,
  url: error.url,
});

/**
 * Centraliza el manejo de errores HTTP: un 401 reabre el login de Keycloak,
 * el resto se normaliza antes de llegar al consumidor.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        void keycloak.login({ redirectUri: window.location.href });
      }
      return throwError(() => normalizeApiError(error));
    })
  );
};

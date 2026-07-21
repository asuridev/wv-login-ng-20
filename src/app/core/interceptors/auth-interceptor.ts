import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';

import { environment } from '../../../environments/environment';

/** Orígenes propios a los que sí corresponde enviar el token de sesión. */
const TRUSTED_BASE_URLS = [
  environment.apiBaseUrl,
  environment.apiConfig.baseUrl,
  environment.urls.persistenteApi,
];

const isTrustedUrl = (url: string): boolean =>
  // Una URL relativa siempre apunta al propio origen del webview.
  !/^https?:\/\//i.test(url) || TRUSTED_BASE_URLS.some((base) => url.startsWith(base));

/**
 * Adjunta el token de Keycloak a las peticiones propias. Los servicios
 * públicos de terceros (ej. la API de IP) se dejan intactos: un header
 * `Authorization` los convertiría en peticiones con preflight CORS.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Keycloak).token;

  if (!token || !isTrustedUrl(req.url)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

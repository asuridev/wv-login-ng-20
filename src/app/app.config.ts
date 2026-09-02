import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideKeycloak } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideKeycloak({
      config: {
        url: environment.keycloak.issuer,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      // Sin `initOptions` a propósito: keycloak-angular solo registra su
      // `provideAppInitializer` cuando se le pasan, y ese initializer corre
      // antes de que el Router evalúe la URL — es lo que hacía que hasta las
      // rutas públicas (`/gone`, `/not-found`, `**`) redirigieran al SSO. La
      // inicialización se difiere a `authGuard` vía `KeycloakInit`.
    }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideTanStackQuery(new QueryClient()),
  ],
};

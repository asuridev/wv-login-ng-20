import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideKeycloak } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { BANKS_CONFIG } from './core/config/partners/configurations/banks-config';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { KeycloakInit } from './core/services/keycloak-init';

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
      // incondicionalmente — es lo que hacía que hasta las rutas públicas
      // (`/gone`, `/not-found`, `**`) redirigieran al SSO. Aquí se sustituye
      // por el initializer condicionado de abajo.
    }),
    provideAppInitializer(() => {
      // Solo el árbol protegido inicializa Keycloak; las rutas públicas no
      // deben tocar el SSO. Se hace en el initializer —y no dentro de
      // `authGuard`— para que keycloak-js limpie los parámetros OAuth de la URL
      // ANTES de que el Router la serialice: si no, acaban dentro de
      // `state.url` y por tanto dentro del `redirectUri` del login, que OIDC
      // rechaza por llevar fragmento.
      const [, partnerId = ''] = window.location.pathname.split('/');
      if (!BANKS_CONFIG[partnerId]) {
        return;
      }

      return inject(KeycloakInit).ensureInitialized();
    }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideTanStackQuery(new QueryClient()),
  ],
};

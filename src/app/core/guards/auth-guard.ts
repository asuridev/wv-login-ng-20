import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import Keycloak from 'keycloak-js';

import { KeycloakInit } from '../services/keycloak-init';

/**
 * Puerta del árbol protegido. Dispara la inicialización de Keycloak (diferida
 * a propósito, ver `KeycloakInit`) y exige sesión activa.
 *
 * No se usa `createAuthGuard` de keycloak-angular porque lee
 * `keycloak.authenticated` de forma síncrona, antes de que el init resuelva:
 * con init diferido daría siempre `false` y forzaría un login incluso a
 * usuarios con sesión SSO válida.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const keycloak = inject(Keycloak);
  const keycloakInit = inject(KeycloakInit);

  // `init()` resuelve con el estado de sesión resultante del check-sso.
  if (await keycloakInit.ensureInitialized()) {
    return true;
  }

  // OIDC no admite fragmento en `redirect_uri`. Quitarlo evita, ademas,
  // arrastrar los parametros de un callback previo si el init no llego a
  // limpiar la URL antes de que el Router la serializara en `state.url`.
  const [path] = state.url.split('#');

  await keycloak.login({ redirectUri: window.location.origin + path });
  return false;
};

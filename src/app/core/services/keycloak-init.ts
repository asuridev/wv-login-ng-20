import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

/**
 * Inicializa Keycloak bajo demanda. `app.config.ts` provee la instancia sin
 * `initOptions` a propósito, para que el arranque de la app no redirija al SSO
 * y las rutas públicas (`/gone`, `/not-found`, `**`) no toquen Keycloak. Este
 * servicio es el único punto que llama `init()`, y solo lo invoca `authGuard`
 * al entrar al árbol protegido `/:partnerId`.
 */
@Injectable({ providedIn: 'root' })
export class KeycloakInit {
  private readonly keycloak = inject(Keycloak);
  private initialization?: Promise<boolean>;

  /** Resuelve con `true` si hay sesión SSO activa. Idempotente. */
  ensureInitialized(): Promise<boolean> {
    this.initialization ??= this.keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
    });

    return this.initialization;
  }
}

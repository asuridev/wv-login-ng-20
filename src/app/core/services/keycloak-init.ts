import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

/**
 * Inicializa Keycloak bajo demanda. `app.config.ts` provee la instancia sin
 * `initOptions` a propósito, para que las rutas públicas (`/gone`,
 * `/not-found`, `**`) no toquen el SSO; el arranque solo inicializa cuando la
 * URL apunta a un partner configurado. Este servicio es el único punto que
 * llama `init()` — que además lanza si se invoca dos veces sobre la misma
 * instancia, de ahí la memoización.
 */
@Injectable({ providedIn: 'root' })
export class KeycloakInit {
  private readonly keycloak = inject(Keycloak);
  private initialization?: Promise<boolean>;

  /** Resuelve con `true` si hay sesión SSO activa. Idempotente. */
  ensureInitialized(): Promise<boolean> {
    // Un fallo se resuelve como "sin sesión" en vez de propagarse: memoizar el
    // rechazo dejaría toda navegación posterior reventando dentro del guard.
    // Es el mismo contrato que aplicaba keycloak-angular en su initializer.
    this.initialization ??= this.keycloak
      .init({ onLoad: 'check-sso', checkLoginIframe: false })
      .catch((error: unknown) => {
        console.error('Keycloak initialization failed', error);
        return false;
      });

    return this.initialization;
  }
}

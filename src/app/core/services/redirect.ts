import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

import { environment } from '../../../environments/environment';
import { PartnerStore } from '../store/partner.store';

@Injectable({ providedIn: 'root' })
export class RedirectService {
  private readonly keycloak = inject(Keycloak);
  private readonly partnerStore = inject(PartnerStore);

  /**
   * Redirige a otra SPA usando `id_token_hint` para SSO silencioso.
   * @param appBaseUrl URL base de la app destino, ej: 'https://app-b.com'
   * @param targetPath ruta destino en la app B, ej: '/home'
   * @param clientId client de Keycloak por el que sale el traspaso. Lo decide el
   *   flujo de la card (`environment.keycloak.redirectClientIds`). Obligatorio a
   *   propósito: un valor por defecto dejaría a un flujo nuevo salir en silencio
   *   por el client de otro.
   */
  async redirectTo(appBaseUrl: string, targetPath: string, clientId: string): Promise<void> {
    // Refrescar el token si expira en menos de 30 segundos.
    try {
      await this.keycloak.updateToken(30);
    } catch {
      await this.keycloak.login();
      return;
    }

    const idToken = this.keycloak.idToken;
    if (!idToken) {
      await this.keycloak.login();
      return;
    }

    // El state transporta la ruta destino para restaurarla tras el callback.
    const state = {
      path: targetPath,
      productType: this.partnerStore.productType(),
      correlationId: this.partnerStore.correlationId() ?? '',
      partnerId: this.partnerStore.partnerId(),
    };

    const authUrl = new URL(
      `${environment.keycloak.issuer}/realms/${environment.keycloak.realm}/protocol/openid-connect/auth`
    );

    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', `${appBaseUrl}/auth/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile');
    authUrl.searchParams.set('prompt', 'none');
    authUrl.searchParams.set('id_token_hint', idToken); // identifica al usuario
    authUrl.searchParams.set('state', encodeURIComponent(JSON.stringify(state)));

    this.navigate(authUrl.toString());
  }

  /** Aislado en un método para que los tests puedan interceptar la navegación. */
  protected navigate(url: string): void {
    window.location.href = url;
  }
}

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
   */
  async redirectTo(appBaseUrl: string, targetPath = '/'): Promise<void> {
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

    authUrl.searchParams.set('client_id', environment.keycloak.redirectClintId);
    authUrl.searchParams.set('redirect_uri', `${appBaseUrl}/auth/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile');
    authUrl.searchParams.set('prompt', 'none');
    authUrl.searchParams.set('id_token_hint', idToken); // identifica al usuario
    authUrl.searchParams.set('state', encodeURIComponent(JSON.stringify(state)));

    window.location.href = authUrl.toString();
  }
}

import { Injectable, inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { RedirectService } from '../../../core/services/redirect';
import { PartnerStore } from '../../../core/store/partner.store';
import { CardFlow, CardFlowContext } from '../../../core/models/card-flow-model';

/**
 * Flujo comercial: traspasa la sesión al destino sin registrar venta.
 *
 * Para las cards que no originan una venta —consultas, contenido para el
 * asesor—. El `correlationId` se genera igual: viaja en el `state` del auth URL
 * y es lo que permite trazar el flujo en el destino.
 *
 * A diferencia de `SalesFlow`, redirige a la URL de la card tal cual, sin el
 * sufijo `/wv_<partnerId>`: los destinos comerciales no se segmentan por partner
 * en la ruta. El partner sigue viajando dentro del `state`.
 */
@Injectable({ providedIn: 'root' })
export class CommercialFlow implements CardFlow {
  private readonly partnerStore = inject(PartnerStore);
  private readonly redirectService = inject(RedirectService);

  async run({ url, productType }: CardFlowContext): Promise<void> {
    // Se fijan antes de redirigir: RedirectService los lee para el `state`.
    this.partnerStore.setProductType(productType);
    this.partnerStore.newCorrelationId();

    await this.redirectService.redirectTo(
      url,
      '/home',
      environment.keycloak.redirectClientIds.commercial
    );
  }
}

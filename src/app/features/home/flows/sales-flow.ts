import { Injectable, inject } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';

import { environment } from '../../../../environments/environment';
import { RedirectService } from '../../../core/services/redirect';
import { PartnerStore } from '../../../core/store/partner.store';
import { CardFlow, CardFlowContext } from '../../../core/models/card-flow-model';
import { MasheryQueries } from '../queries/mashery-queries';

/**
 * Flujo de venta: registra la venta en Mashery y, solo si esa llamada tuvo
 * éxito, traspasa la sesión al destino. Es el flujo por defecto.
 *
 * Si `sale_completed` falla se propaga el error y no hay redirección: salir sin
 * haber registrado la venta dejaría el flujo sin traza.
 */
@Injectable({ providedIn: 'root' })
export class SalesFlow implements CardFlow {
  private readonly partnerStore = inject(PartnerStore);
  private readonly redirectService = inject(RedirectService);
  private readonly masheryQueries = inject(MasheryQueries);

  private readonly saleCompleted = injectMutation(() => this.masheryQueries.sendSaleCompleted());

  async run({ url, productType, partnerId }: CardFlowContext): Promise<void> {
    // Se fijan antes de mutar: los leen tanto la mutación como el `state` del
    // auth URL. Cada flujo de redirección viaja con su propio correlationId.
    this.partnerStore.setProductType(productType);
    this.partnerStore.newCorrelationId();

    await this.saleCompleted.mutateAsync();

    await this.redirectService.redirectTo(
      `${url}/wv_${partnerId}`,
      '/home',
      environment.keycloak.redirectClientIds.sales
    );
  }
}

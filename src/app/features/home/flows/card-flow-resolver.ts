import { Injectable, inject } from '@angular/core';

import { CardFlow, CardFlowName } from '../../../core/models/card-flow-model';
import { CommercialFlow } from './commercial-flow';
import { SalesFlow } from './sales-flow';

/**
 * Traduce el `flow` declarado por una card a su implementación.
 *
 * El `Record<CardFlowName, CardFlow>` es deliberado: el compilador exige una
 * entrada por cada literal de la unión, así que no se puede agregar un flujo al
 * tipo y olvidar registrarlo aquí.
 */
@Injectable({ providedIn: 'root' })
export class CardFlowResolver {
  private readonly flows: Record<CardFlowName, CardFlow> = {
    sales: inject(SalesFlow),
    commercial: inject(CommercialFlow),
  };

  resolve(flow: CardFlowName): CardFlow {
    return this.flows[flow];
  }
}

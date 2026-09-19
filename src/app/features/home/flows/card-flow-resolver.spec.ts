import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

import { CARD_FLOW_NAMES } from '../../../core/models/card-flow-model';
import { RedirectService } from '../../../core/services/redirect';
import { MasheryQueries } from '../queries/mashery-queries';
import { CardFlowResolver } from './card-flow-resolver';
import { CommercialFlow } from './commercial-flow';
import { SalesFlow } from './sales-flow';

describe('CardFlowResolver', () => {
  let resolver: CardFlowResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(new QueryClient()),
        // Los flujos reales dependen de Keycloak a través de RedirectService.
        { provide: RedirectService, useValue: { redirectTo: () => Promise.resolve() } },
        { provide: MasheryQueries, useValue: { sendSaleCompleted: () => ({ mutationFn: () => Promise.resolve({}) }) } },
      ],
    });
    resolver = TestBed.inject(CardFlowResolver);
  });

  it('resuelve una implementación para cada flujo declarado', () => {
    for (const flow of CARD_FLOW_NAMES) {
      expect(resolver.resolve(flow)).withContext(flow).toBeDefined();
    }
  });

  it('resuelve cada nombre a su flujo correspondiente', () => {
    expect(resolver.resolve('sales')).toBe(TestBed.inject(SalesFlow));
    expect(resolver.resolve('commercial')).toBe(TestBed.inject(CommercialFlow));
  });
});

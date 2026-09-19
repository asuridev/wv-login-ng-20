import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

import { RedirectService } from '../../../core/services/redirect';
import { PartnerStore } from '../../../core/store/partner.store';
import { MasheryQueries } from '../queries/mashery-queries';
import { TEST_REDIRECT_CLIENT_IDS, useTestRedirectClients } from './flows-test-support';
import { SalesFlow } from './sales-flow';

const CONTEXT = { url: 'https://destino.example', productType: 1, partnerId: 'partner-demo' };

describe('SalesFlow', () => {
  let flow: SalesFlow;
  let redirectServiceSpy: jasmine.SpyObj<RedirectService>;
  let mutationFn: jasmine.Spy;
  let partnerStore: InstanceType<typeof PartnerStore>;
  let restoreClients: () => void;

  beforeEach(() => {
    restoreClients = useTestRedirectClients();
    redirectServiceSpy = jasmine.createSpyObj('RedirectService', ['redirectTo']);
    redirectServiceSpy.redirectTo.and.resolveTo();
    mutationFn = jasmine.createSpy('mutationFn').and.resolveTo({});

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(new QueryClient()),
        { provide: RedirectService, useValue: redirectServiceSpy },
        {
          provide: MasheryQueries,
          useValue: { sendSaleCompleted: () => ({ mutationFn }) },
        },
      ],
    });

    flow = TestBed.inject(SalesFlow);
    partnerStore = TestBed.inject(PartnerStore);
  });

  afterEach(() => restoreClients());

  it('registra la venta antes de redirigir', async () => {
    await flow.run(CONTEXT);

    expect(mutationFn).toHaveBeenCalled();
    expect(redirectServiceSpy.redirectTo).toHaveBeenCalledWith(
      'https://destino.example/wv_partner-demo',
      '/home',
      TEST_REDIRECT_CLIENT_IDS.sales
    );
    expect(mutationFn).toHaveBeenCalledBefore(redirectServiceSpy.redirectTo);
  });

  it('sale por el client de ventas y no por el comercial', async () => {
    await flow.run(CONTEXT);

    const [, , clientId] = redirectServiceSpy.redirectTo.calls.mostRecent().args;
    expect(clientId).toBe(TEST_REDIRECT_CLIENT_IDS.sales);
    expect(clientId).not.toBe(TEST_REDIRECT_CLIENT_IDS.commercial);
  });

  it('fija el productType y un correlationId antes de registrar la venta', async () => {
    await flow.run(CONTEXT);

    expect(partnerStore.productType()).toBe(1);
    expect(partnerStore.correlationId()).toBeTruthy();
  });

  // Salir sin haber registrado la venta dejaría el flujo sin traza.
  it('no redirige si el registro de la venta falla', async () => {
    mutationFn.and.rejectWith(new Error('500'));

    await expectAsync(flow.run(CONTEXT)).toBeRejected();
    expect(redirectServiceSpy.redirectTo).not.toHaveBeenCalled();
  });
});

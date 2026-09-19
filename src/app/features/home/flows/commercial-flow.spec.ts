import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RedirectService } from '../../../core/services/redirect';
import { PartnerStore } from '../../../core/store/partner.store';
import { CommercialFlow } from './commercial-flow';
import { TEST_REDIRECT_CLIENT_IDS, useTestRedirectClients } from './flows-test-support';

describe('CommercialFlow', () => {
  let flow: CommercialFlow;
  let redirectServiceSpy: jasmine.SpyObj<RedirectService>;
  let partnerStore: InstanceType<typeof PartnerStore>;
  let restoreClients: () => void;

  beforeEach(() => {
    restoreClients = useTestRedirectClients();
    redirectServiceSpy = jasmine.createSpyObj('RedirectService', ['redirectTo']);
    redirectServiceSpy.redirectTo.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: RedirectService, useValue: redirectServiceSpy },
      ],
    });

    flow = TestBed.inject(CommercialFlow);
    partnerStore = TestBed.inject(PartnerStore);
  });

  afterEach(() => restoreClients());

  it('redirige a la URL de la card sin el sufijo del partner', async () => {
    await flow.run({ url: 'https://destino.example', productType: 5, partnerId: 'partner-demo' });

    expect(redirectServiceSpy.redirectTo).toHaveBeenCalledWith(
      'https://destino.example',
      '/home',
      TEST_REDIRECT_CLIENT_IDS.commercial
    );
  });

  it('sale por el client comercial y no por el de ventas', async () => {
    await flow.run({ url: 'https://destino.example', productType: 5, partnerId: 'partner-demo' });

    const [, , clientId] = redirectServiceSpy.redirectTo.calls.mostRecent().args;
    expect(clientId).toBe(TEST_REDIRECT_CLIENT_IDS.commercial);
    expect(clientId).not.toBe(TEST_REDIRECT_CLIENT_IDS.sales);
  });

  it('fija el productType y un correlationId antes de redirigir', async () => {
    await flow.run({ url: 'https://destino.example', productType: 5, partnerId: 'partner-demo' });

    expect(partnerStore.productType()).toBe(5);
    expect(partnerStore.correlationId()).toBeTruthy();
  });

  it('propaga el error si la redirección falla', async () => {
    redirectServiceSpy.redirectTo.and.rejectWith(new Error('sin sesión'));

    await expectAsync(
      flow.run({ url: 'https://destino.example', productType: 5, partnerId: 'partner-demo' })
    ).toBeRejected();
  });
});

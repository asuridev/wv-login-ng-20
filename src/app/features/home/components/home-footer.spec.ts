import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TEST_PARTNER } from '../../../core/config/partners-test-support';
import { BANKS_CONFIG } from '../../../core/config/partners/configurations/banks-config';
import { PartnerStore } from '../../../core/store/partner.store';
import { HomeFooter } from './home-footer';

describe('HomeFooter', () => {
  let partnerStore: InstanceType<typeof PartnerStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFooter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    partnerStore = TestBed.inject(PartnerStore);
  });

  it('no renderiza logos mientras no haya partner resuelto', () => {
    const fixture = TestBed.createComponent(HomeFooter);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('img').length).toBe(0);
  });

  it('renderiza los logos del partner activo', () => {
    partnerStore.setPartner(TEST_PARTNER);

    const fixture = TestBed.createComponent(HomeFooter);
    fixture.detectChanges();

    const sources = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('img')
    ).map((img) => img.getAttribute('src'));

    // Las rutas se derivan de la configuración del partner: cambiar un logo en
    // `banks-config.ts` no debe romper este test.
    const { assets } = BANKS_CONFIG[TEST_PARTNER];
    const esperados = [assets.logoVigilado, assets.logoFooter, assets.logoAval, assets.logoCardif];

    expect(sources.length).toBe(esperados.length);
    for (const logo of esperados) {
      expect(sources).toContain(logo);
    }
  });
});

import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PARTNER_CARDS } from '../config/partner-cards-source';
import { TEST_PARTNER, TEST_PARTNER_SIN_CARDS } from '../config/partners-test-support';
import { DEFAULT_PARTNER_TEXT, PARTNERS_TEXT } from '../config/partners-register';
import {
  BANKS_CONFIG,
  BANKS_CONFIG_DEFAULT,
} from '../config/partners/configurations/banks-config';
import { PartnerStore } from './partner.store';

describe('PartnerStore', () => {
  let store: InstanceType<typeof PartnerStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    store = TestBed.inject(PartnerStore);
  });

  it('arranca sin partner resuelto', () => {
    expect(store.partnerId()).toBeNull();
    expect(store.config()).toBeNull();
    expect(store.cards()).toEqual([]);
  });

  it('resuelve un partner conocido con su configuración y textos', () => {
    store.setPartner(TEST_PARTNER);

    // Todo se compara contra la propia configuración: cambiarla no rompe nada.
    expect(store.partnerId()).toBe(TEST_PARTNER);
    expect(store.config()?.id).toBe(BANKS_CONFIG[TEST_PARTNER].id);
    expect(store.bodyTitle()).toBe(PARTNERS_TEXT[DEFAULT_PARTNER_TEXT].body.title);
  });

  it('toma las cards del JSON del partner', () => {
    store.setPartner(TEST_PARTNER);

    // Se compara contra el registro, no contra un contenido fijo: los JSON son
    // configuración y cambian cuando el partner ajusta su oferta.
    expect(store.cards().map((card) => card.key)).toEqual(
      PARTNER_CARDS[TEST_PARTNER].map((card) => card.key)
    );
  });

  it('no muestra cards cuando el partner no declara las suyas', () => {
    store.setPartner(TEST_PARTNER_SIN_CARDS);

    expect(store.cards()).toEqual([]);
    // Los textos fijos del partner siguen viniendo del código.
    expect(store.bodyTitle()).toBe(PARTNERS_TEXT[DEFAULT_PARTNER_TEXT].body.title);
  });

  it('cae al partner por defecto cuando el id no existe', () => {
    store.setPartner('no-existe');

    expect(store.partnerId()).toBe(BANKS_CONFIG_DEFAULT);
    expect(store.config()?.id).toBe(BANKS_CONFIG_DEFAULT);
  });

  it('guarda los datos de traza de la venta', () => {
    store.setCorrelationId('abc-123');
    store.setAdvisorId('42');
    store.setProductType(4);
    store.setIp('1.2.3.4');

    expect(store.correlationId()).toBe('abc-123');
    expect(store.advisorId()).toBe('42');
    expect(store.productType()).toBe(4);
    expect(store.ip()).toBe('1.2.3.4');
  });

  it('genera un correlationId distinto en cada invocación', () => {
    const first = store.newCorrelationId();
    const second = store.newCorrelationId();

    expect(first).not.toBe(second);
    expect(store.correlationId()).toBe(second);
  });
});

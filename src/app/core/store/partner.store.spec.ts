import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BANKS_CONFIG_DEFAULT } from '../config/partners/configurations/banks-config';
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
    store.setPartner('occidente');

    expect(store.partnerId()).toBe('occidente');
    expect(store.config()?.id).toBe('cardif-banco-occidente');
    expect(store.bodyTitle()).toBe('¿Qué quieres hacer hoy?');
    expect(store.cards().length).toBeGreaterThan(0);
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
});

import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BANKS_CONFIG_DEFAULT } from '../config/partners/configurations/banks-config';
import { PartnerStore } from './partner.store';

type WindowWithEnv = Window & { env?: Record<string, string> };

describe('PartnerStore', () => {
  let store: InstanceType<typeof PartnerStore>;
  const testWindow = window as WindowWithEnv;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    store = TestBed.inject(PartnerStore);
  });

  afterEach(() => {
    delete testWindow.env;
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
  });

  it('usa las cards del configmap cuando el partner declara su variable', () => {
    const cards = [
      {
        key: 'mastips',
        title: 'Mastips',
        badge: 'Tus avances',
        button: 'Ver ahora',
        productType: 5,
        permission: 'card:mastips',
        url: 'https://webview-uat.cardif.com.co',
      },
    ];
    const bytes = new TextEncoder().encode(JSON.stringify(cards));
    testWindow.env = { SETTING_CARDS_OCCIDENTE: btoa(String.fromCharCode(...bytes)) };

    store.setPartner('occidente');

    expect(store.cards().length).toBe(1);
    expect(store.cards()[0].title).toBe('Mastips');
    // El resto de los textos del partner sigue viniendo del código.
    expect(store.bodyTitle()).toBe('¿Qué quieres hacer hoy?');
  });

  it('no muestra cards cuando el partner no declara su variable', () => {
    delete testWindow.env;

    store.setPartner('occidente');

    expect(store.cards()).toEqual([]);
    // Los textos fijos del partner siguen viniendo del código.
    expect(store.bodyTitle()).toBe('¿Qué quieres hacer hoy?');
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

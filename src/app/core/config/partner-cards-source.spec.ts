import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

import { environment } from '../../../environments/environment';
import { CardFlowResolver } from '../../features/home/flows/card-flow-resolver';
import { MasheryQueries } from '../../features/home/queries/mashery-queries';
import { RedirectService } from '../services/redirect';
import { DEFAULT_CARD_FLOW, isCardFlowName } from '../models/card-flow-model';
import { PartnerCardConfig } from '../models/partner-theme-model';
import { PARTNER_CARDS, resolvePartnerCards, toCardText } from './partner-cards-source';

/**
 * Los JSON de `partners/cards/` son configuración: cambian cada vez que un
 * partner ajusta su oferta. Estas pruebas cubren la mecánica de lectura y
 * mapeo con fixtures propias, y sobre los archivos reales solo verifican
 * invariantes que deben cumplirse sin importar su contenido.
 */
const FIXTURE: PartnerCardConfig = {
  key: 'demo',
  title: 'Card de prueba',
  badge: 'Etiqueta',
  button: 'Ver ahora',
  productType: 7,
  permission: 'card:demo',
  url: { default: 'https://default.example' },
};

function withEnvironmentName(name: string, assertion: () => void): void {
  const original = environment.environmentName;
  (environment as { environmentName: string }).environmentName = name;
  try {
    assertion();
  } finally {
    (environment as { environmentName: string }).environmentName = original;
  }
}

describe('toCardText', () => {
  it('aplica el flujo por defecto cuando la card no declara `flow`', () => {
    expect(toCardText(FIXTURE).flow).toBe(DEFAULT_CARD_FLOW);
  });

  it('respeta el flujo declarado por la card', () => {
    expect(toCardText({ ...FIXTURE, flow: 'commercial' }).flow).toBe('commercial');
  });

  // No se puede validar en compilación (un JSON importado no infiere
  // literales), así que el guard evita que un typo deje la card sin flujo.
  // Quien lo detecta de verdad es la invariante del final de este archivo.
  it('cae al flujo por defecto si el declarado no existe', () => {
    expect(toCardText({ ...FIXTURE, flow: 'no-existe' }).flow).toBe(DEFAULT_CARD_FLOW);
  });

  it('mapea la card al modelo que consume el template', () => {
    expect(toCardText(FIXTURE)).toEqual({
      key: 'demo',
      flow: 'sales',
      title: 'Card de prueba',
      text: '',
      permission: 'card:demo',
      cardButton: { label: 'Ver ahora', redirecTo: 'https://default.example', productType: 7 },
      cardBadge: { label: 'Etiqueta' },
    });
  });

  it('deja `permission` sin definir cuando la card no lo declara', () => {
    const { permission, ...sinPermiso } = FIXTURE;

    expect(toCardText(sinPermiso).permission).toBeUndefined();
  });

  it('usa la URL del entorno activo cuando la card la declara', () => {
    const card = { ...FIXTURE, url: { default: 'https://default.example', qa: 'https://qa.example' } };

    withEnvironmentName('qa', () => {
      expect(toCardText(card).cardButton.redirecTo).toBe('https://qa.example');
    });
  });

  it('cae a `default` cuando el entorno activo no tiene override', () => {
    const card = { ...FIXTURE, url: { default: 'https://default.example', qa: 'https://qa.example' } };

    withEnvironmentName('production', () => {
      expect(toCardText(card).cardButton.redirecTo).toBe('https://default.example');
    });
  });
});

describe('resolvePartnerCards', () => {
  it('devuelve lista vacía para un partner sin entrada en el registro', () => {
    expect(resolvePartnerCards('no-existe')).toEqual([]);
  });

  it('devuelve una card por cada entrada del JSON, en el mismo orden', () => {
    for (const [partnerId, cards] of Object.entries(PARTNER_CARDS)) {
      expect(resolvePartnerCards(partnerId).map((card) => card.key))
        .withContext(partnerId)
        .toEqual(cards.map((card) => card.key));
    }
  });
});

// Invariantes sobre los archivos reales: no dependen de qué cards tenga cada
// partner, solo de que estén bien formadas.
describe('JSON de cards de los partners', () => {
  it('declara al menos un partner', () => {
    expect(Object.keys(PARTNER_CARDS).length).toBeGreaterThan(0);
  });

  it('usa claves únicas y no vacías dentro de cada partner', () => {
    for (const [partnerId, cards] of Object.entries(PARTNER_CARDS)) {
      const keys = cards.map((card) => card.key);

      expect(keys.every((key) => key.trim() !== ''))
        .withContext(`${partnerId}: hay claves vacías`)
        .toBeTrue();
      expect(new Set(keys).size)
        .withContext(`${partnerId}: hay claves duplicadas (rompen el track del @for)`)
        .toBe(keys.length);
    }
  });

  // Sobre el JSON crudo, no sobre el resultado de `toCardText`: el guard ya
  // habría convertido un typo en el flujo por defecto y no quedaría rastro.
  it('declara flujos existentes en el JSON de cada partner', () => {
    for (const [partnerId, cards] of Object.entries(PARTNER_CARDS)) {
      for (const card of cards) {
        if (card.flow === undefined) continue;

        expect(isCardFlowName(card.flow))
          .withContext(`${partnerId} / ${card.key}: flujo desconocido "${card.flow}"`)
          .toBeTrue();
      }
    }
  });

  it('resuelve una implementación para el flujo de cada card', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(new QueryClient()),
        // Los flujos reales dependen de Keycloak a través de RedirectService.
        { provide: RedirectService, useValue: { redirectTo: () => Promise.resolve() } },
        {
          provide: MasheryQueries,
          useValue: { sendSaleCompleted: () => ({ mutationFn: () => Promise.resolve({}) }) },
        },
      ],
    });
    const resolver = TestBed.inject(CardFlowResolver);

    for (const partnerId of Object.keys(PARTNER_CARDS)) {
      for (const card of resolvePartnerCards(partnerId)) {
        expect(resolver.resolve(card.flow))
          .withContext(`${partnerId} / ${card.key}`)
          .toBeDefined();
      }
    }
  });

  // Una card sin URL se filtra en home.ts y nunca se renderiza: seria un
  // despliegue silenciosamente incompleto.
  it('resuelve una URL de redirección para toda card declarada', () => {
    for (const partnerId of Object.keys(PARTNER_CARDS)) {
      for (const card of resolvePartnerCards(partnerId)) {
        expect(card.cardButton.redirecTo?.trim())
          .withContext(`${partnerId} / ${card.key}`)
          .toBeTruthy();
      }
    }
  });
});

import { environment } from '../../../environments/environment';
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
  it('mapea la card al modelo que consume el template', () => {
    expect(toCardText(FIXTURE)).toEqual({
      key: 'demo',
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

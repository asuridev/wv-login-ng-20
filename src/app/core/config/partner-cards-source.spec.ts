import { resolvePartnerCards } from './partner-cards-source';

type WindowWithEnv = Window & { env?: Record<string, string> };

/** Mismo encoding que `dev/cards/encode.js`: JSON -> UTF-8 -> base64. */
function encode(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));

  return btoa(String.fromCharCode(...bytes));
}

const VALID_CARD = {
  key: 'protection',
  title: 'Seguro Tradicional',
  badge: 'A tu medida',
  button: 'Ver ahora',
  productType: 1,
  permission: 'card:protection',
  url: 'https://webview-uat.cardif.com.co',
};

describe('resolvePartnerCards', () => {
  const testWindow = window as WindowWithEnv;

  beforeEach(() => {
    testWindow.env = {};
    spyOn(console, 'error');
  });

  afterEach(() => {
    delete testWindow.env;
  });

  it('devuelve lista vacía cuando el partner no declara la variable', () => {
    expect(resolvePartnerCards('occidente')).toEqual([]);
  });

  it('devuelve lista vacía cuando la variable está vacía', () => {
    testWindow.env = { SETTING_CARDS_OCCIDENTE: '' };

    expect(resolvePartnerCards('occidente')).toEqual([]);
  });

  it('convierte los guiones del partnerId en guiones bajos', () => {
    testWindow.env = { SETTING_CARDS_CARDIF_BANCO_DEFAULT: encode([VALID_CARD]) };

    expect(resolvePartnerCards('cardif-banco-default').length).toBe(1);
  });

  it('mapea una card válida al modelo que consume el template', () => {
    testWindow.env = { SETTING_CARDS_OCCIDENTE: encode([VALID_CARD]) };

    expect(resolvePartnerCards('occidente')).toEqual([
      {
        title: 'Seguro Tradicional',
        text: '',
        permission: 'card:protection',
        cardButton: {
          label: 'Ver ahora',
          redirecTo: 'https://webview-uat.cardif.com.co',
          productType: 1,
        },
        cardBadge: { label: 'A tu medida' },
      },
    ]);
  });

  it('preserva los acentos del copy', () => {
    testWindow.env = {
      SETTING_CARDS_TUYA: encode([{ ...VALID_CARD, key: 'progress', title: '¿Cómo voy?' }]),
    };

    expect(resolvePartnerCards('tuya')[0].title).toBe('¿Cómo voy?');
  });

  it('respeta el orden del array como orden de render', () => {
    const second = { ...VALID_CARD, key: 'mastips', title: 'Mastips', productType: 5 };
    testWindow.env = { SETTING_CARDS_TUYA: encode([second, VALID_CARD]) };

    expect(resolvePartnerCards('tuya').map((card) => card.title)).toEqual([
      'Mastips',
      'Seguro Tradicional',
    ]);
  });

  it('acepta una card sin permission', () => {
    const { permission, ...sinPermiso } = VALID_CARD;
    testWindow.env = { SETTING_CARDS_OCCIDENTE: encode([sinPermiso]) };

    expect(resolvePartnerCards('occidente')[0].permission).toBeUndefined();
  });

  it('devuelve lista vacía cuando el base64 es ilegible', () => {
    testWindow.env = { SETTING_CARDS_OCCIDENTE: 'no-es-base64-valido!!' };

    expect(resolvePartnerCards('occidente')).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('devuelve lista vacía cuando el JSON no es un array', () => {
    testWindow.env = { SETTING_CARDS_OCCIDENTE: encode({ cards: [VALID_CARD] }) };

    expect(resolvePartnerCards('occidente')).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('descarta solo la entrada inválida y conserva el resto', () => {
    const sinUrl = { ...VALID_CARD, key: 'modular', url: '' };
    const productTypeTexto = { ...VALID_CARD, key: 'progress', productType: '0' };
    testWindow.env = {
      SETTING_CARDS_OCCIDENTE: encode([sinUrl, VALID_CARD, productTypeTexto]),
    };

    const cards = resolvePartnerCards('occidente');

    expect(cards.length).toBe(1);
    expect(cards[0].title).toBe('Seguro Tradicional');
    expect(console.error).toHaveBeenCalledTimes(2);
  });
});

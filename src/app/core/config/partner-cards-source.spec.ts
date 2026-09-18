import { environment } from '../../../environments/environment';
import { resolvePartnerCards } from './partner-cards-source';

describe('resolvePartnerCards', () => {
  it('devuelve lista vacía para un partner sin entrada en el registro', () => {
    expect(resolvePartnerCards('no-existe')).toEqual([]);
  });

  it('mapea las cards del JSON al modelo que consume el template', () => {
    const [card] = resolvePartnerCards('occidente');

    expect(card).toEqual({
      key: 'protection',
      title: 'Seguro Tradicional',
      text: '',
      permission: 'card:protection',
      cardButton: {
        label: 'Ver ahora',
        redirecTo: jasmine.any(String),
        productType: 1,
      },
      cardBadge: { label: 'A tu medida' },
    });
  });

  it('respeta el orden del array como orden de render', () => {
    expect(resolvePartnerCards('occidente').map((card) => card.key)).toEqual([
      'protection',
      'mastips',
    ]);
  });

  it('preserva los acentos del copy', () => {
    const progress = resolvePartnerCards('tuya').find((card) => card.key === 'progress');

    expect(progress?.title).toBe('¿Cómo voy?');
  });

  // La suite corre con environment.test.ts (environmentName: 'test'), que los
  // JSON no sobrescriben: debe caer al `default`.
  it('usa la URL `default` cuando el entorno activo no tiene override', () => {
    const [card] = resolvePartnerCards('occidente');

    expect(environment.environmentName).toBe('test');
    expect(card.cardButton.redirecTo).toBe('https://webview-uat.cardif.com.co');
  });

  it('usa el override del entorno activo cuando el JSON lo declara', () => {
    const original = environment.environmentName;
    // `environment` es el módulo que lee `resolveUrl`; se restaura al terminar.
    (environment as { environmentName: string }).environmentName = 'production';

    try {
      expect(resolvePartnerCards('occidente')[0].cardButton.redirecTo).toBe(
        'https://webview.cardif.com.co'
      );
    } finally {
      (environment as { environmentName: string }).environmentName = original;
    }
  });

  it('cada partner declara su propio conjunto de cards', () => {
    expect(resolvePartnerCards('occidente').length).toBe(2);
    expect(resolvePartnerCards('tuya').length).toBe(4);
    expect(resolvePartnerCards('bogota').length).toBe(2);
  });
});

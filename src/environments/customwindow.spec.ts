import { CustomWindow } from './customwindow';

type WindowWithEnv = Window & { env?: Record<string, string> };

describe('CustomWindow', () => {
  const testWindow = window as WindowWithEnv;

  afterEach(() => {
    delete testWindow.env;
  });

  it('no lanza cuando env.js no cargó', () => {
    delete testWindow.env;

    expect(() => CustomWindow.instance.getWindowAttribute('CUALQUIERA')).not.toThrow();
    expect(CustomWindow.instance.getWindowAttribute('CUALQUIERA', 'fallback')).toBe('fallback');
  });

  it('devuelve el valor inyectado por el contenedor', () => {
    testWindow.env = { URL_KEYCLOAK: 'https://sso.example' };

    expect(CustomWindow.instance.getWindowAttribute('URL_KEYCLOAK', 'fallback')).toBe(
      'https://sso.example'
    );
  });

  // envsubst deja la clave presente con cadena vacía cuando la variable no está
  // definida en el contenedor; sin este caso el defaultValue nunca aplicaría.
  it('trata la cadena vacía como ausente', () => {
    testWindow.env = { KEYCLOAK_REALM: '' };

    expect(CustomWindow.instance.getWindowAttribute('KEYCLOAK_REALM', 'default')).toBe('default');
  });

  it('devuelve undefined sin defaultValue', () => {
    testWindow.env = {};

    expect(CustomWindow.instance.getWindowAttribute('NO_DECLARADA')).toBeUndefined();
  });
});

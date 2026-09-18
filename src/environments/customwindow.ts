/**
 * Puente hacia la configuración de runtime inyectada por el contenedor.
 *
 * El `envsubst` del entrypoint genera `/tmp/env.js` a partir de
 * `public/assets/env/env.template.js`; nginx lo sirve en `/assets/env/env.js`
 * e `index.html` lo carga antes del bundle, poblando `window.env`.
 */
export class CustomWindow {
  static instance = new CustomWindow();

  /**
   * Una variable no definida en el contenedor la sustituye `envsubst` por
   * cadena vacía, dejando la clave presente en `window.env`; por eso el vacío
   * cuenta como ausente y cae al `defaultValue`. En `ng serve` no existe
   * `env.js` y `window.env` es `undefined`.
   */
  getWindowAttribute(envProperty: string, defaultValue?: string): string | undefined {
    const env = (window as unknown as { env?: Record<string, string> }).env;
    const value = env?.[envProperty];

    return value ? value : defaultValue;
  }
}

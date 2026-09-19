import { PARTNER_CARDS } from './partner-cards-source';
import { BANKS_CONFIG } from './partners/configurations/banks-config';

/**
 * Punto único de verdad para los partners que usan los tests.
 *
 * Los specs no escriben un slug a mano: lo derivan de la configuración, de modo
 * que agregar, renombrar o quitar un partner no rompa ninguna prueba. Por la
 * misma razón, ningún test afirma valores que vivan en `banks-config.ts`,
 * `partner-id-map.ts`, `partners-register.ts` o `partners/cards/*.json`: los
 * deriva de esas mismas fuentes, o usa una fixture propia.
 */
function primerPartner(conCards: boolean): string {
  const id = Object.keys(BANKS_CONFIG).find((partnerId) => partnerId in PARTNER_CARDS === conCards);

  if (!id) {
    throw new Error(
      `No hay ningún partner ${conCards ? 'con' : 'sin'} cards declaradas en la configuración.`
    );
  }

  return id;
}

/** Partner de referencia: el primero del registro que declara cards. */
export const TEST_PARTNER = primerPartner(true);

/** Partner sin cards declaradas, para los casos de ausencia. */
export const TEST_PARTNER_SIN_CARDS = primerPartner(false);

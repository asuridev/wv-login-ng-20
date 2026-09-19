/**
 * Flujos de activación disponibles al pulsar una card.
 *
 * Los nombres describen el tipo de operación de negocio —`sales` inicia una
 * venta, `commercial` no— y no el mecanismo de traspaso de sesión: así un flujo
 * puede cambiar de mecanismo sin quedar mal nombrado.
 *
 * El flujo lo declara cada card en su JSON (`partners/cards/<partner>.json`),
 * no el `productType`: ese es un dato de negocio que viaja al backend dentro
 * del `state`, y dos productos distintos pueden compartir flujo.
 *
 * Agregar uno nuevo: crear el servicio en `flows/`, añadir su literal aquí y
 * registrarlo en `CardFlowResolver`.
 */
export const CARD_FLOW_NAMES = ['sales', 'commercial'] as const;

export type CardFlowName = (typeof CARD_FLOW_NAMES)[number];

/** Flujo aplicado cuando la card no declara `flow`. */
export const DEFAULT_CARD_FLOW: CardFlowName = 'sales';

/**
 * TypeScript infiere `string` —no el literal— para los campos de texto de un
 * JSON importado, así que el `flow` declarado en la configuracion no se puede
 * validar en compilación. Este guard lo estrecha en `toCardText`, y la
 * invariante de `partner-cards-source.spec.ts` verifica que toda card declare
 * uno registrado: un valor mal escrito falla en la suite, no en producción.
 */
export function isCardFlowName(value: unknown): value is CardFlowName {
  return CARD_FLOW_NAMES.includes(value as CardFlowName);
}

/** Lo que el flujo necesita saber de la card pulsada. */
export interface CardFlowContext {
  /** URL base del destino, ya resuelta contra el entorno activo. */
  url: string;
  productType: number;
  partnerId: string;
}

export interface CardFlow {
  /** Ejecuta el flujo. Lanza si falla; el componente traduce el error a toast. */
  run(context: CardFlowContext): Promise<void>;
}

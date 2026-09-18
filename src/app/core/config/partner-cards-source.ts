import { CustomWindow } from '../../../environments/customwindow';
import { PartnerCardConfig, PartnerCardText } from '../models/partner-theme-model';

/** Prefijo de la variable de entorno que declara las cards de un partner. */
const ENV_PREFIX = 'SETTING_CARDS_';

/** `occidente` -> `SETTING_CARDS_OCCIDENTE`; `cardif-banco-default` -> `..._CARDIF_BANCO_DEFAULT`. */
function envKeyFor(partnerId: string): string {
  return `${ENV_PREFIX}${partnerId.replace(/-/g, '_').toUpperCase()}`;
}

/**
 * base64 -> UTF-8 -> JSON. `atob` devuelve bytes, no caracteres: sin el
 * `TextDecoder` los acentos del copy (`¿Cómo voy?`) llegan corruptos.
 */
function decode(raw: string): unknown {
  const bytes = Uint8Array.from(atob(raw), (char) => char.charCodeAt(0));

  return JSON.parse(new TextDecoder().decode(bytes));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidCard(value: unknown): value is PartnerCardConfig {
  if (typeof value !== 'object' || value === null) return false;

  const card = value as Record<string, unknown>;

  return (
    isNonEmptyString(card['key']) &&
    isNonEmptyString(card['title']) &&
    isNonEmptyString(card['badge']) &&
    isNonEmptyString(card['button']) &&
    isNonEmptyString(card['url']) &&
    typeof card['productType'] === 'number' &&
    Number.isFinite(card['productType']) &&
    (card['permission'] === undefined || typeof card['permission'] === 'string')
  );
}

/** Nota: `redirecTo` conserva el typo historico del modelo. */
function toCardText(card: PartnerCardConfig): PartnerCardText {
  return {
    title: card.title,
    text: '',
    permission: card.permission,
    cardButton: {
      label: card.button,
      redirecTo: card.url,
      productType: card.productType,
    },
    cardBadge: { label: card.badge },
  };
}

/**
 * Cards del partner segun el configmap del contenedor. Es la unica fuente:
 * sin variable declarada el partner no muestra cards.
 *
 * - Variable ausente, vacia o ilegible -> `[]`.
 * - Entrada individual invalida -> se descarta solo esa; las demas se renderizan.
 *
 * El orden del array es el orden de render.
 */
export function resolvePartnerCards(partnerId: string): PartnerCardText[] {
  const raw = CustomWindow.instance.getWindowAttribute(envKeyFor(partnerId));
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = decode(raw);
  } catch {
    console.error(`[cards] ${envKeyFor(partnerId)} no es un JSON valido en base64.`);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.error(`[cards] ${envKeyFor(partnerId)} debe contener un array de cards.`);
    return [];
  }

  return parsed
    .filter((card, index) => {
      if (isValidCard(card)) return true;
      console.error(`[cards] ${envKeyFor(partnerId)}[${index}] ignorada: estructura invalida.`);
      return false;
    })
    .map(toCardText);
}

import { environment } from '../../../environments/environment';
import { DEFAULT_CARD_FLOW, isCardFlowName } from '../models/card-flow-model';
import { PartnerCardConfig, PartnerCardText } from '../models/partner-theme-model';
import bogota from './partners/cards/bogota.json';
import occidente from './partners/cards/occidente.json';
import tuya from './partners/cards/tuya.json';

/**
 * Cards desplegadas por partner. Agregar socios aquí.
 *
 * La configuración viaja en el bundle: cambiarla exige reconstruir la imagen.
 * Es una decisión deliberada — las cards cambian poco y el equipo prefiere el
 * costo del redespliegue antes que sostener configuración fuera del repositorio.
 */
export const PARTNER_CARDS: Record<string, PartnerCardConfig[]> = { occidente, tuya, bogota };

/** El override del entorno activo gana sobre `default`. */
function resolveUrl(url: PartnerCardConfig['url']): string {
  return url[environment.environmentName] ?? url.default;
}

/**
 * Traduce una card del JSON al modelo que consumen store y template.
 * Exportada para poder probarla con fixtures, sin depender del contenido de los
 * JSON reales. Nota: `redirecTo` conserva el typo historico del modelo.
 */
export function toCardText(card: PartnerCardConfig): PartnerCardText {
  return {
    key: card.key,
    flow: isCardFlowName(card.flow) ? card.flow : DEFAULT_CARD_FLOW,
    title: card.title,
    text: '',
    permission: card.permission,
    cardButton: {
      label: card.button,
      redirecTo: resolveUrl(card.url),
      productType: card.productType,
    },
    cardBadge: { label: card.badge },
  };
}

/**
 * Cards del partner. El orden del array es el orden de render; un partner sin
 * entrada en el registro no muestra ninguna card.
 */
export function resolvePartnerCards(partnerId: string): PartnerCardText[] {
  return (PARTNER_CARDS[partnerId] ?? []).map(toCardText);
}

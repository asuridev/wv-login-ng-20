import { PartnerText } from '../models/partner-theme-model';
import { cardifBancoDefaultText } from './partners/text/cardif-banco-default-text';

/** Registro de textos por partner. Agregar socios aquí. */
export const PARTNERS_TEXT: Record<string, PartnerText> = {
  'cardif-banco-default': cardifBancoDefaultText,
};

export const DEFAULT_PARTNER_TEXT = 'cardif-banco-default';

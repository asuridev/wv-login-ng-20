import { PartnerText } from '../models/partner-theme-model';

/**
 * Textos del partner que no dependen del configmap: encabezado, título del
 * cuerpo y pie. Las cards ya no viven aquí — las declara cada partner en su
 * variable `SETTING_CARDS_<PARTNER>` (ver `partner-cards-source.ts`).
 */
const cardifBancoDefaultText: PartnerText = {
  header: {
    title: '',
    text: '',
  },
  body: {
    title: '¿Qué quieres hacer hoy?',
    text: '',
    cards: [],
  },
  footer: {
    title: '',
    text: '',
  },
};

/** Registro de textos por partner. Agregar socios aquí. */
export const PARTNERS_TEXT: Record<string, PartnerText> = {
  'cardif-banco-default': cardifBancoDefaultText,
};

export const DEFAULT_PARTNER_TEXT = 'cardif-banco-default';

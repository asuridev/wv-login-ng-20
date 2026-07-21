import { environment } from '../../../../../environments/environment';
import { PartnerText } from '../../../models/partner-theme-model';

export const cardifBancoDefaultText: PartnerText = {
  header: {
    title: '',
    text: '',
  },
  body: {
    title: '¿Qué quieres hacer hoy?',
    text: '',
    cards: [
      {
        title: 'Seguro Tradicional',
        text: '',
        permission: 'card:protection',
        cardButton: {
          label: 'Ver ahora',
          redirecTo: environment.cards.urlRedirect.protection,
          productType: 1,
        },
        cardBadge: {
          label: 'A tu medida',
        },
      },
      {
        title: 'Seguro Modular',
        text: '',
        permission: 'card:modular',
        cardButton: {
          label: 'Ver ahora',
          redirecTo: environment.cards.urlRedirect.modular,
          productType: 4,
        },
        cardBadge: {
          label: 'Plan estándar',
        },
      },
      {
        title: '¿Cómo voy?',
        text: '',
        permission: 'card:progress',
        cardButton: {
          label: 'Ver ahora',
          redirecTo: environment.cards.urlRedirect.progress,
          productType: 0,
        },
        cardBadge: {
          label: 'Tus avances',
        },
      },
      {
        title: 'Portal Médico',
        text: '',
        permission: 'card:medical',
        cardButton: {
          label: 'Ver ahora',
          redirecTo: environment.cards.urlRedirect.medical,
          // TODO: confirmar el productType real del Portal Médico con negocio.
          productType: 5,
        },
        cardBadge: {
          label: 'Tus avances',
        },
      },
    ],
  },
  footer: {
    title: '',
    text: '',
  },
};

import { CardFlowName } from '../app/core/models/card-flow-model';

/**
 * Client de Keycloak con el que cada flujo traspasa la sesión al destino.
 *
 * Es configuración de infraestructura —cada realm tiene sus propios clients—,
 * por eso vive en el environment y no en el JSON de la card. Al ser un
 * `Record<CardFlowName, string>`, el compilador exige un client por cada flujo en
 * cada environment: un flujo nuevo sin client rompe el build, no el SSO.
 */
export type RedirectClientIds = Record<CardFlowName, string>;

import { environment } from '../../../../environments/environment';
import { RedirectClientIds } from '../../../../environments/keycloak-config-model';

/**
 * Clients ficticios, distintos entre sí, para los specs de flujos.
 *
 * Los environments reales pueden asignar el mismo client a varios flujos (hoy
 * `environment.test.ts` lo hace), y con eso un test no distinguiría si un flujo
 * sale por el suyo o por el de otro. Además, los tests no dependen de valores de
 * configuración: los fijan ellos.
 */
export const TEST_REDIRECT_CLIENT_IDS: RedirectClientIds = {
  sales: 'client-ventas-test',
  commercial: 'client-comercial-test',
};

/** Sustituye los clients del environment durante el spec; devuelve cómo restaurarlos. */
export function useTestRedirectClients(): () => void {
  const keycloak = environment.keycloak as { redirectClientIds: RedirectClientIds };
  const original = keycloak.redirectClientIds;
  keycloak.redirectClientIds = TEST_REDIRECT_CLIENT_IDS;

  return () => {
    keycloak.redirectClientIds = original;
  };
}

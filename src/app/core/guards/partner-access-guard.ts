import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

import { PARTNER_ID_MAP } from '../config/partner-id-map';

/** El token debe autorizar explícitamente al partner de la ruta. */
export const partnerAccessGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const keycloak = inject(Keycloak);

  const routePartnerId = PARTNER_ID_MAP[route.paramMap.get('partnerId') ?? ''];
  const partnerIds = (keycloak.tokenParsed?.['partner_id'] as string[]) ?? [];

  return partnerIds.includes(routePartnerId) ? true : router.createUrlTree(['/not-found']);
};

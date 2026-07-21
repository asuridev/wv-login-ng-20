import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { BANKS_CONFIG } from '../config/partners/configurations/banks-config';

/** El `:partnerId` de la ruta debe existir en la configuración de bancos. */
export const partnerGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const partnerId = route.paramMap.get('partnerId') ?? '';

  return BANKS_CONFIG[partnerId] ? true : router.createUrlTree(['/not-found']);
};

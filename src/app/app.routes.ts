import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { partnerAccessGuard } from './core/guards/partner-access-guard';
import { partnerGuard } from './core/guards/partner-guard';

export const routes: Routes = [
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/pages/not-found/not-found'),
  },
  {
    path: ':partnerId',
    canActivate: [authGuard, partnerGuard, partnerAccessGuard],
    loadComponent: () =>
      import('./features/home/layouts/partner-layout').then((m) => m.PartnerLayout),
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/pages/not-found/not-found'),
  },
];

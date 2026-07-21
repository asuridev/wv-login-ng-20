import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home'),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

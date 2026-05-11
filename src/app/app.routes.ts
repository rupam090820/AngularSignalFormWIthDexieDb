import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'registration', pathMatch: 'full' },
  {
    path: 'registration',
    loadComponent: () => import('./components/registration/registration.component').then(m => m.RegistrationComponent),
  },
  {
    path: 'session-drafts',
    loadComponent: () => import('./components/session-drafts/session-drafts.component').then(m => m.SessionDraftsComponent),
  },
  {
    path: 'cart-items',
    loadComponent: () => import('./components/cart-items/cart-items.component').then(m => m.CartItemsComponent),
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chargers',
    pathMatch: 'full'
  },
  {
    path: 'chargers',
    loadChildren: async () =>
      (await import('./features/chargers/chargers.routes')).CHARGERS_ROUTES,
    data: { title: '🔌 Charger List' }
  },
  {
    path: 'evs',
    loadChildren: async () =>
      (await import('./features/evs/evs.routes')).EVS_ROUTES,
    data: { title: '🚗 EV List' }
  },
  {
    path: 'status',
    loadChildren: async () =>
      (await import('./features/status/status.routes')).STATUS_ROUTES,
    data: { title: '🔄 Charging Status' }
  }
  // TODO: To add a route for a not found page
];

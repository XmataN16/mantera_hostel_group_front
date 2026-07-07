import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      // <-- ДОБАВЬ ЭТУ СТРОКУ:
      {
        path: 'hotels',
        loadComponent: () => import('./features/hotels/hotels.component').then(m => m.HotelsComponent)
      },
    ]
  },
  { path: '**', redirectTo: '' }
];

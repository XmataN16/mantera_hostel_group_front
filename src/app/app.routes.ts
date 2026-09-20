import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'hotels',
        loadComponent: () =>
          import('./features/hotels/hotels.component')
            .then(m => m.HotelsComponent)
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./features/rooms/rooms.component')
            .then(m => m.RoomsComponent)
      },
      {
        path: 'room-types',
        canActivate: [roleGuard(['ADMIN', 'MANAGER'])],
        loadComponent: () =>
          import('./features/room-types/room-types.component')
            .then(m => m.RoomTypesComponent)
      },
      {
        path: 'additional-services',
        canActivate: [roleGuard(['ADMIN', 'MANAGER'])],
        loadComponent: () =>
          import('./features/additional-services/additional-services.component')
            .then(m => m.AdditionalServicesComponent)
      },
      {
        path: 'rate-plans',
        canActivate: [roleGuard(['ADMIN', 'MANAGER'])],
        loadComponent: () =>
          import('./features/rate-plans/rate-plans.component')
            .then(m => m.RatePlansComponent)
      },
      {
        path: 'employees',
        canActivate: [roleGuard(['ADMIN', 'MANAGER'])],
        loadComponent: () =>
          import('./features/employees/employees.component')
            .then(m => m.EmployeesComponent)
      },
      {
        path: 'reservations/booking-board',
        loadComponent: () =>
          import('./features/booking-board/booking-board.component')
            .then(m => m.BookingBoardComponent)
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./features/reservations/reservations.component')
            .then(m => m.ReservationsComponent)
      },
      {
        path: 'guests',
        loadComponent: () =>
          import('./features/guests/guests.component')
            .then(m => m.GuestsComponent)
      },
      {
        path: 'reports',
        canActivate: [roleGuard(['ADMIN', 'MANAGER', 'ACCOUNTANT'])],
        loadComponent: () =>
          import('./features/reports/reports.component')
            .then(m => m.ReportsComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/users/users.component')
            .then(m => m.UsersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

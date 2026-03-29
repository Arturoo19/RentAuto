import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Cars } from './pages/cars/cars';
import { Guard } from './services/guard';
import { Reservations } from './pages/reservations/reservations';
import { AdminGuard } from './services/admin.guard';
import { AdminCarsForm } from './pages/admin-cars-form/admin-cars-form';
import { ReservationForm } from './components/reservation-form/reservation-form';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'reservar/:id', component: ReservationForm },
  { path: 'home', component: Home },
  { path: 'cars', component: Cars, canActivate: [Guard] },
  { path: 'register', component: Register },
  { path: 'reservations', component: Reservations, canActivate: [Guard] },
  { path: 'admin/cars/new', component: AdminCarsForm, canActivate: [Guard, AdminGuard] },
  { path: 'admin/cars/edit/:id', component: AdminCarsForm, canActivate: [Guard, AdminGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

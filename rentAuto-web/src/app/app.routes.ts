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
import { Dashboard } from './pages/dashboard/dashboard';
import { NewsDetail } from './pages/news-detail/news-detail';
import { InfoPage } from './pages/info-page/info-page';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'reservar/:id', component: ReservationForm, canActivate: [Guard] },
  { path: 'home', component: Home },
  { path: 'cars', component: Cars, canActivate: [Guard] },
  { path: 'register', component: Register },
  { path: 'reservations', component: Reservations, canActivate: [Guard] },
  { path: 'dashboard', component: Dashboard, canActivate: [Guard] },
  { path: 'news/:slug', component: NewsDetail },
  { path: 'privacy', component: InfoPage, data: { pageType: 'privacy' } },
  { path: 'terms', component: InfoPage, data: { pageType: 'terms' } },
  { path: 'cookies', component: InfoPage, data: { pageType: 'cookies' } },
  { path: 'contact', component: InfoPage, data: { pageType: 'contact' } },
  { path: 'profile', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'admin/cars/new', component: AdminCarsForm, canActivate: [Guard, AdminGuard] },
  { path: 'admin/cars/edit/:id', component: AdminCarsForm, canActivate: [Guard, AdminGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Cars } from './pages/cars/cars';
import { Guard } from './services/guard';
import { Reservations } from './pages/reservations/reservations';

export const routes: Routes = [
    {path: 'login', component: Login},
    {path: 'home', component: Home},
    {path: 'cars', component: Cars, canActivate:[Guard]},
    {path: 'register', component: Register},
    {path: 'reservations', component: Reservations,canActivate:[Guard]},
    {path: '', redirectTo: 'home', pathMatch: 'full'}
];

import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Cars } from './services/cars';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';

export const routes: Routes = [
    {path: 'login', component: Login},
    {path: 'home', component: Home},
    {path: 'cars', component: Cars},
    {path: 'register', component: Register},
    {path: '', redirectTo: 'home', pathMatch: 'full'}
];

import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Categories } from './pages/categories/categories';
import { CategoryPage } from './pages/category/category';
import { LoginComponent } from './pages/auth/login';
import { RegisterComponent } from './pages/auth/register';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'categories', component: Categories},
    {path: 'categories/:id', component: CategoryPage},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent}
];

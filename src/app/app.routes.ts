import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Categories } from './pages/categories/categories';
import { CategoryPage } from './pages/category/category';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'categories', component: Categories},
    {path: 'categories/:id', component: CategoryPage}
];

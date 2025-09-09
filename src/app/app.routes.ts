import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Categories } from './pages/categories/categories';
import { CategoryPage } from './pages/category/category';
import { LoginComponent } from './pages/auth/login';
import { RegisterComponent } from './pages/auth/register';
import { AdminComponent } from './pages/admin/admin';
import { AdminProductsComponent } from './pages/admin/products/admin-products';
import { AdminCategoriesComponent } from './pages/admin/categories/admin-categories';
import { AdminUsersComponent } from './pages/admin/users/admin-users';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'categories', component: Categories},
    {path: 'categories/:id', component: CategoryPage},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
            {path: '', component: AdminComponent}, // Dashboard
            {path: 'products', component: AdminProductsComponent},
            {path: 'categories', component: AdminCategoriesComponent},
            {path: 'users', component: AdminUsersComponent}
        ]
    }
];

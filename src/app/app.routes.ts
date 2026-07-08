import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: 'admin/dashboard',
                loadComponent: () => import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard)
            },
            {
                path: 'hr/dashboard',
                loadComponent: () => import('./pages/hr/dashboard/dashboard').then((m) => m.Dashboard)
            },
            {
                path: 'employee/dashboard',
                loadComponent: () => import('./pages/employee/dashboard/dashboard').then((m) => m.Dashboard)
            }
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword)
    }
];

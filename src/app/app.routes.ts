import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { authGuard } from './core/guards/auth/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: 'admin',
                canActivate: [authGuard],
                data: { role: 'admin' },
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard) },
                    { path: 'manage-hr', loadComponent: () => import('./pages/admin/manage-hr/manage-hr').then((m) => m.ManageHr) },
                    { path: 'departments', loadComponent: () => import('./pages/admin/departments/departments').then((m) => m.Departments) },
                    { path: 'departments/:id/employees', loadComponent: () => import('./pages/admin/employees/employees').then((m) => m.Employees) },
                ]
            },
            {
                path: 'hr',
                canActivate: [authGuard],
                data: { role: 'hr' },
                children: [
                    { path: 'dashboard', loadComponent: () => import('./pages/hr/dashboard/dashboard').then((m) => m.Dashboard) },
                    { path: 'symbols', loadComponent: () => import('./pages/hr/symbols/symbols').then((m) => m.Symbols) },
                    { path: 'schedule', loadComponent: () => import('./pages/hr/schedule/schedule').then((m) => m.Schedule) },
                    { path: 'reports', loadComponent: () => import('./pages/hr/reports/reports').then((m) => m.Reports) }
                ]
            },
            {
                path: 'employee',
                canActivate: [authGuard],
                data: { role: 'employee' },
                children: [
                    { path: '', redirectTo: 'attendance', pathMatch: 'full' },
                    { path: 'attendance', loadComponent: () => import('./pages/employee/attendance/attendance').then((m) => m.Attendance) },
                    { path: 'dashboard', loadComponent: () => import('./pages/employee/dashboard/dashboard').then((m) => m.Dashboard) },
                    { path: 'leave', loadComponent: () => import('./pages/employee/leave/leave').then((m) => m.Leave) }
                ]
            },
            {
                path: 'settings',
                canActivate: [authGuard],
                loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings)
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

import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            // Sau này bạn sẽ đưa các trang con (Dashboard, User,...) vào đây
        ]
    }
];

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/services/auth';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        const role = this.authService.getRole();
        
        if (role === 'hr') {
            this.model = [
                {
                    label: 'Phân hệ HR',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/hr/dashboard'] },
                        { label: 'Quản lý ký hiệu', icon: 'pi pi-fw pi-tags', routerLink: ['/hr/symbols'] },
                        { label: 'Tạo lịch đi làm', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/hr/schedule'] },
                        { label: 'Chốt công & Báo cáo', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/hr/reports'] }
                    ]
                }
            ];
        } else if (role === 'admin') {
            this.model = [
                {
                    label: 'Phân hệ Admin',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] }
                    ]
                }
            ];
        } else if (role === 'employee') {
            this.model = [
                {
                    label: 'Phân hệ Nhân viên',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/employee/dashboard'] }
                    ]
                }
            ];
        } else {
            this.model = [
                {
                    label: 'Home',
                    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
                }
            ];
        }
    }
}

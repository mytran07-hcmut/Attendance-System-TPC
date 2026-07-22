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

    constructor(private authService: AuthService) { }

    ngOnInit() {
        const role = this.authService.getRole();

        // Luôn có menu của Nhân viên
        const employeeMenu: any = {
            label: 'Phân hệ Nhân viên',
            items: [
                { label: 'Chấm công', icon: 'pi pi-fw pi-calendar-clock', routerLink: ['/employee/attendance'] },
                { label: 'Dashboard', icon: 'pi pi-fw pi-chart-pie', routerLink: ['/employee/dashboard'] },
                { label: 'Đăng ký phép', icon: 'pi pi-fw pi-file-edit', routerLink: ['/employee/leave'] }
            ]
        };

        if (role === 'head' || role === 'admin') {
            employeeMenu.items.push({ label: 'Quản lý lịch', icon: 'pi pi-fw pi-users', routerLink: ['/employee/manage-schedule'] });
        }

        this.model = [employeeMenu];

        const hrMenu = {
            label: 'Phân hệ HR',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/hr/dashboard'] },
                { label: 'Quản lý ký hiệu', icon: 'pi pi-fw pi-tags', routerLink: ['/hr/symbols'] },
                { label: 'Lịch', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/hr/schedule'] },
                { label: 'Chốt công & Báo cáo', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/hr/reports'] }
            ]
        };

        const adminMenu = {
            label: 'Phân hệ Admin',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] },
                { label: 'Quản lý HR', icon: 'pi pi-fw pi-users', routerLink: ['/admin/manage-hr'] },
                { label: 'Quản lý Nhân viên', icon: 'pi pi-fw pi-building', routerLink: ['/admin/departments'] }
            ]
        };

        if (role === 'hr') {
            this.model.unshift(hrMenu);
        } else if (role === 'admin') {
            this.model.unshift(hrMenu);
            this.model.unshift(adminMenu);
        }
    }
}

import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action border-none" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img src="assets/logo-tpc.png" alt="logo" style="height: 35px; width: auto;">
            </a>
        </div>


        <div class="layout-topbar-actions flex align-items-center gap-2">
            <button type="button" class="layout-topbar-action border-none" (click)="toggleDarkMode()">
                <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
            </button>
            
            <div class="relative">
                <button
                    class="layout-topbar-action border-none text-white border-circle flex align-items-center justify-content-center bg-primary hover:bg-primary-reverse transition-colors transition-duration-150"
                    style="width: 2.5rem; height: 2.5rem;"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                >
                    <i class="pi pi-palette"></i>
                </button>
                <app-configurator />
            </div>

            <button class="layout-topbar-action border-none">
                <i class="pi pi-bell"></i>
            </button>

            <button class="layout-topbar-action p-0 border-circle border-2 border-primary overflow-hidden flex align-items-center justify-content-center bg-white" style="width: 2.5rem; height: 2.5rem;">
                <i class="pi pi-user text-primary" style="font-size: 1.2rem;"></i>
            </button>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    layoutService = inject(LayoutService);

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }
}

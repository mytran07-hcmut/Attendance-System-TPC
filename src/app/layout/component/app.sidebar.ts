import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppMenu } from './app.menu';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService, User } from '../../core/services/auth';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, RouterModule, CommonModule],
    template: `
        <div class="layout-sidebar">
            @if (currentUser()) {
                <div class="sidebar-profile">
                    <div class="profile-avatar">
                        {{ currentUser()!.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="profile-info">
                        <span class="profile-name">{{ currentUser()!.name }}</span>
                        @if (currentUser()!.roleLabel) {
                            <span class="profile-role" [ngClass]="currentUser()!.role">{{ currentUser()!.roleLabel }}</span>
                        }
                    </div>
                </div>
            }
            <app-menu></app-menu>
        </div>
    `,
    styles: [`
        .sidebar-profile {
            display: flex;
            align-items: center;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--surface-border);
        }
        .profile-avatar {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: var(--primary-color-text);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            margin-right: 1rem;
        }
        .profile-info {
            display: flex;
            flex-direction: column;
        }
        .profile-name {
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--text-color);
        }
        .profile-role {
            font-size: 0.85rem;
            margin-top: 0.25rem;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            background-color: var(--surface-ground);
            color: var(--text-color-secondary);
            display: inline-block;
            width: fit-content;
        }
        .profile-role.admin {
            background-color: #ffcdd2;
            color: #c62828;
        }
        .profile-role.hr {
            background-color: #bbdefb;
            color: #1565c0;
        }
        .profile-role.head {
            background-color: #e1bee7;
            color: #6a1b9a;
        }
    `]
})
export class AppSidebar implements OnInit, OnDestroy {
    layoutService = inject(LayoutService);

    router = inject(Router);

    el = inject(ElementRef);
    
    authService = inject(AuthService);

    currentUser = this.authService.currentUserSignal;

    private outsideClickListener: ((event: MouseEvent) => void) | null = null;

    private destroy$ = new Subject<void>();

    constructor() {
        effect(() => {
            const state = this.layoutService.layoutState();

            if (this.layoutService.isDesktop()) {
                if (state.overlayMenuActive) {
                    this.bindOutsideClickListener();
                } else {
                    this.unbindOutsideClickListener();
                }
            } else {
                if (state.mobileMenuActive) {
                    this.bindOutsideClickListener();
                } else {
                    this.unbindOutsideClickListener();
                }
            }
        });
    }

    ngOnInit() {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event) => {
                const navEvent = event as NavigationEnd;
                this.onRouteChange(navEvent.urlAfterRedirects);
            });

        this.onRouteChange(this.router.url);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.unbindOutsideClickListener();
    }

    private onRouteChange(path: string) {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            activePath: path,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            mobileMenuActive: false,
            menuHoverActive: false
        }));
    }

    private bindOutsideClickListener() {
        if (!this.outsideClickListener) {
            this.outsideClickListener = (event: MouseEvent) => {
                if (this.isOutsideClicked(event)) {
                    this.layoutService.layoutState.update((val) => ({
                        ...val,
                        overlayMenuActive: false,
                        staticMenuMobileActive: false,
                        mobileMenuActive: false,
                        menuHoverActive: false
                    }));
                }
            };

            document.addEventListener('click', this.outsideClickListener);
        }
    }

    private unbindOutsideClickListener() {
        if (this.outsideClickListener) {
            document.removeEventListener('click', this.outsideClickListener);
            this.outsideClickListener = null;
        }
    }

    private isOutsideClicked(event: MouseEvent): boolean {
        const topbarButtonEl = document.querySelector('.topbar-start > button');
        const sidebarEl = this.el.nativeElement;

        return !(
            sidebarEl?.isSameNode(event.target as Node) ||
            sidebarEl?.contains(event.target as Node) ||
            topbarButtonEl?.isSameNode(event.target as Node) ||
            topbarButtonEl?.contains(event.target as Node)
        );
    }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@/app/core/services/auth';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule],
    templateUrl: './settings.html'
})
export class Settings {
    authService = inject(AuthService);
    
    currentUser = this.authService.currentUserSignal;
    
    editName: string = '';
    
    constructor() {
        const user = this.currentUser();
        if (user) {
            this.editName = user.name;
        }
    }
    
    saveProfile() {
        if (this.editName.trim()) {
            this.authService.updateProfile(this.editName.trim());
        }
    }
    
    logout() {
        this.authService.logout();
    }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  login(role: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role);
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
    }
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole');
    }
    return null;
  }

  isRole(role: string): boolean {
    return this.getRole() === role;
  }
}

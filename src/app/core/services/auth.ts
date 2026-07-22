import { Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

import { EMPLOYEES_MOCK } from '../mocks/employees.mock';

export interface User {
  email: string;
  name: string;
  role: string;
  roleLabel: string;
  employeeCode: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUserSignal: WritableSignal<User | null> = signal<User | null>(null);

  constructor(private router: Router) {
    this.currentUserSignal.set(this.getCurrentUser());
  }

  login(email: string, password: string): boolean {
    if (password === '123') {
      const emp = EMPLOYEES_MOCK.find(e => e.email === email);
      if (emp) {
        let role = 'employee';
        const titleLower = emp.title.toLowerCase();
        
        if (titleLower.includes('giám đốc')) {
          role = 'admin';
        } else if (titleLower.includes('trưởng phòng')) {
          role = 'head';
        } else if (titleLower.includes('hr')) {
          role = 'hr';
        }

        const user: User = {
          email: emp.email,
          name: emp.fullName,
          role: role,
          roleLabel: emp.title,
          employeeCode: emp.code
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSignal.set(user);
        return true;
      }
    }
    return false;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  updateProfile(name: string) {
    const user = this.currentUserSignal();
    if (user) {
      const updatedUser = { ...user, name };
      this.currentUserSignal.set(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
  }

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  getRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isRole(role: string): boolean {
    return this.getRole() === role;
  }
}

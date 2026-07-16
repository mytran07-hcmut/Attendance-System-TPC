import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  email: string;
  name: string;
  role: string;
  roleLabel: string;
}

const MOCK_USERS: User[] = [
  { email: 'admin@tpc.com', name: 'Nguyễn Văn Admin', role: 'admin', roleLabel: 'Admin' },
  { email: 'hr@tpc.com', name: 'Trần Thị HR', role: 'hr', roleLabel: 'HR' },
  { email: 'head@tpc.com', name: 'Lê Văn Trưởng Phòng', role: 'head', roleLabel: 'Trưởng phòng' },
  { email: 'employee@tpc.com', name: 'Phạm Nhân Viên', role: 'employee', roleLabel: '' }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    if (password === '123') {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return true;
      }
    }
    return false;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
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

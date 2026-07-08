import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email: string = '';
  password!: string;
  rememberMe: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Vui lòng nhập email và mật khẩu';
      return;
    }

    if (this.email.endsWith('@admin.com') && this.password === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.email.endsWith('@hr.com') && this.password === 'hr') {
      this.router.navigate(['/hr/dashboard']);
    } else if (this.email.endsWith('@employee.com') && this.password === 'employee') {
      this.router.navigate(['/employee/dashboard']);
    } else {
      this.errorMessage = 'Tài khoản hoặc mật khẩu không chính xác';
    }
  }
}

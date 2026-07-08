import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  email: string = '';
  message: string = '';
  isSent: boolean = false;

  onSubmit() {
    this.message = '';
    this.isSent = false;
    
    if (!this.email) {
      this.message = 'Vui lòng nhập địa chỉ email của bạn';
      return;
    }
    
    // Giả lập xử lý gửi email
    this.isSent = true;
    this.message = `Mật khẩu mới đã được gửi tới email ${this.email}. Vui lòng kiểm tra hộp thư.`;
  }
}

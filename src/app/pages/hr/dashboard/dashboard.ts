import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  pendingRequests = [
    { id: 1, employee: 'Nguyễn Văn A', department: 'IT', type: 'Xin nghỉ phép', date: '10/08/2026', status: 'Chờ duyệt' },
    { id: 2, employee: 'Trần Thị B', department: 'Kế toán', type: 'Đăng ký làm thêm', date: '12/08/2026', status: 'Chờ duyệt' },
    { id: 3, employee: 'Lê Văn C', department: 'Nhân sự', type: 'Đi trễ', date: '09/08/2026', status: 'Chờ duyệt' }
  ];

  approve(request: any) {
    request.status = 'Đã duyệt';
  }

  reject(request: any) {
    request.status = 'Từ chối';
  }
}

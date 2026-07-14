import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TableModule, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  metrics = {
    totalWorkHours: 160,
    remainingLeaveDays: 10,
    usedLeaveDays: 2
  };

  leaveHistory = [
    { id: 1, type: 'Nghỉ phép năm (AL)', from: '10/07/2026', to: '11/07/2026', reason: 'Du lịch gia đình', status: 'Đã duyệt' },
    { id: 2, type: 'Nghỉ ốm', from: '25/06/2026', to: '25/06/2026', reason: 'Sốt siêu vi', status: 'Đã duyệt' },
    { id: 3, type: 'Nghỉ việc riêng', from: '15/07/2026', to: '15/07/2026', reason: 'Giải quyết việc cá nhân', status: 'Chờ duyệt' }
  ];

  ngOnInit() {
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Đã duyệt': return 'success';
      case 'Chờ duyệt': return 'warning';
      case 'Từ chối': return 'danger';
      default: return 'info';
    }
  }
}

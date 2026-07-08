import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-hr-reports',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToolbarModule, TagModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports {
  reports = [
    { id: 1, employee: 'Nguyễn Văn A', department: 'IT', totalHC: 20, totalOFF: 2, totalL: 0, status: 'Đủ công' },
    { id: 2, employee: 'Trần Thị B', department: 'Kế toán', totalHC: 22, totalOFF: 0, totalL: 0, status: 'Đủ công' },
    { id: 3, employee: 'Lê Văn C', department: 'Nhân sự', totalHC: 18, totalOFF: 2, totalL: 2, status: 'Thiếu công' }
  ];

  exportExcel() {
    console.log('Exporting to Excel...');
  }
}

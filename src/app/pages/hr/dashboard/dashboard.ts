import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatabaseService, DepartmentRequest } from '../../../core/services/database.service';
@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, DialogModule, RouterModule, TooltipModule, InputTextModule, IconFieldModule, InputIconModule, ToastModule],
  providers: [MessageService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  departmentScheduleRequests: DepartmentRequest[] = [];
  pendingRequests: any[] = [];

  presentEmployees = [
    { id: 1, name: 'Phạm Thị D', department: 'IT', checkInTime: '08:00 AM' },
    { id: 2, name: 'Hoàng Văn E', department: 'Kế toán', checkInTime: '08:15 AM' },
    { id: 3, name: 'Vũ Thị F', department: 'Nhân sự', checkInTime: '07:55 AM' },
    { id: 4, name: 'Bùi Văn G', department: 'Marketing', checkInTime: '08:05 AM' }
  ];

  absentEmployees = [
    { id: 1, name: 'Nguyễn Văn A', department: 'IT', type: 'Có phép', reason: 'Nghỉ ốm' },
    { id: 2, name: 'Đặng Thị H', department: 'Sales', type: 'Không phép', reason: 'Không có lý do' },
    { id: 3, name: 'Lê Văn C', department: 'Nhân sự', type: 'Có phép', reason: 'Nghỉ việc riêng' }
  ];

  selectedRequest: any = null;
  displayDialog: boolean = false;
  displayPresentDialog: boolean = false;
  displayAbsentDialog: boolean = false;

  constructor(private db: DatabaseService, private messageService: MessageService) {
    this.db.deptRequests$.subscribe(requests => {
      this.departmentScheduleRequests = Object.values(requests).filter(req => req.status === 'PENDING_HR');
    });
    this.db.leaveRequests$.subscribe(requests => {
      this.pendingRequests = Object.values(requests).filter(req => req.status === 'PENDING');
    });
  }

  approveDepartmentSchedule(req: DepartmentRequest) {
    this.db.updateDepartmentRequest(req.department, 'APPROVED');
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã duyệt lịch cho ${req.department}` });
  }

  formatDateRange(dates: string[]): string {
    if (!dates || dates.length === 0) return '';
    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString('vi-VN');
    }
    const start = new Date(dates[0]).toLocaleDateString('vi-VN');
    const end = new Date(dates[dates.length - 1]).toLocaleDateString('vi-VN');
    return start === end ? start : `${start} - ${end}`;
  }

  scrollToPending() {
    const el = document.getElementById('pending-requests-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  showPresentList() {
    this.displayPresentDialog = true;
  }

  showAbsentList() {
    this.displayAbsentDialog = true;
  }

  showDialog(request: any) {
    this.selectedRequest = request;
    this.displayDialog = true;
  }

  approve(request: any) {
    this.db.updateLeaveRequestStatus(request.id, 'APPROVED');
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã duyệt đơn' });
    this.displayDialog = false;
  }

  reject(request: any) {
    this.db.updateLeaveRequestStatus(request.id, 'REJECTED');
    this.messageService.add({ severity: 'info', summary: 'Thông báo', detail: 'Đã từ chối đơn' });
    this.displayDialog = false;
  }
}

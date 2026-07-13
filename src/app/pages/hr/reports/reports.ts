import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-hr-reports',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToolbarModule, TagModule, ConfirmDialogModule, DialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit {
  reports: any[] = [];
  
  displayEmployeeDetails: boolean = false;
  selectedEmployee: any = null;
  employeeSchedule: any[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {}

  ngOnInit() {
    // Generate 30 mock employees
    const depts = ['IT', 'Kế toán', 'Nhân sự', 'Marketing', 'Kinh doanh', 'Hành chính'];
    const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F', 'Ngô Văn G', 'Dương Thị H', 'Lý Văn I', 'Đinh Thị K'];
    
    for (let i = 1; i <= 30; i++) {
      let hc = Math.floor(Math.random() * 5) + 18; // 18-22
      let off = Math.floor(Math.random() * 3); // 0-2
      let l = Math.floor(Math.random() * 2); // 0-1
      
      this.reports.push({
        id: i,
        employee: names[i % names.length] + ' ' + i,
        department: depts[i % depts.length],
        totalHC: hc,
        totalOFF: off,
        totalL: l,
        status: (hc + off + l >= 22) ? 'Đủ công' : 'Thiếu công'
      });
    }
  }

  exportExcel() {
    console.log('Exporting to Excel...');
  }

  confirmLock() {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn khóa sổ tháng này không? Sau khi khóa sẽ không thể thay đổi dữ liệu.',
      header: 'Xác nhận khóa sổ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Khóa sổ',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã khóa sổ tháng thành công' });
      }
    });
  }

  viewEmployeeDetails(employee: any) {
    this.selectedEmployee = employee;
    
    // Generate a mock month schedule for this employee
    this.employeeSchedule = [];
    const daysInMonth = 31;
    let startDayOfWeek = 2; // Wed
    
    for (let i = 1; i < startDayOfWeek; i++) {
        this.employeeSchedule.push({ date: null, type: null, isWeekend: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        let currentDayOfWeek = (startDayOfWeek + i - 2) % 7;
        let isWeekend = currentDayOfWeek === 5 || currentDayOfWeek === 6;
        
        let type = 'HC';
        if (isWeekend) type = 'OFF';
        else if (Math.random() > 0.9) type = 'AL';
        
        if (i === 30) type = 'L'; // Fake holiday
        
        this.employeeSchedule.push({
            date: i,
            type: type,
            isWeekend: isWeekend,
            holidayName: type === 'L' ? 'Ngày Lễ' : null
        });
    }
    
    this.displayEmployeeDetails = true;
  }

  getSymbolColor(type: string): string {
    switch (type) {
      case 'HC': return '#f4cccc';
      case 'OFF': return '#d9d2e9';
      case 'AL': return '#d9ead3';
      case 'KP': return '#c9daf8';
      case 'L': return '#fff2cc';
      default: return '#ffffff';
    }
  }
}

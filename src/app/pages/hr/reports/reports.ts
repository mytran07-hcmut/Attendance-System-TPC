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
import { InputTextModule } from 'primeng/inputtext';
import { DatabaseService } from '../../../core/services/database.service';

@Component({
  selector: 'app-hr-reports',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToolbarModule, TagModule, ConfirmDialogModule, DialogModule, ToastModule, InputTextModule],
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

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService, private db: DatabaseService) {}

  ngOnInit() {
    this.db.employees$.subscribe(employees => {
      this.reports = [];
      // Use the first 30 employees from DB for reports to avoid overwhelming the view
      const targetEmployees = employees.slice(0, 30);
      
      targetEmployees.forEach((emp, index) => {
        let hc = Math.floor(Math.random() * 5) + 18; // 18-22
        let off = Math.floor(Math.random() * 3); // 0-2
        let l = Math.floor(Math.random() * 2); // 0-1
        
        this.reports.push({
          id: emp.id,
          employee: emp.fullName,
          department: emp.department,
          totalHC: hc,
          totalOFF: off,
          totalL: l,
          status: (hc + off + l >= 22) ? 'Đủ công' : 'Thiếu công'
        });
      });
    });
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
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < startOffset; i++) {
        this.employeeSchedule.push({ date: null, type: null, isWeekend: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        let currentDayOfWeek = (startOffset + i - 1) % 7;
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

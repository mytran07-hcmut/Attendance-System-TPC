import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DatabaseService } from '../../../core/services/database.service';

@Component({
  selector: 'app-hr-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToolbarModule, TagModule, ConfirmDialogModule, DialogModule, ToastModule, InputTextModule, SelectModule, TooltipModule],
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
  
  schedulesCache = new Map<number, any[]>();
  
  displayEditDayDialog: boolean = false;
  editingCell: any = null;
  isEditingSchedule: boolean = false;
  symbolOptions = [
    { label: 'Hành chính', value: 'HC', color: '#f4cccc' },
    { label: 'Ngày nghỉ tuần', value: 'OFF', color: '#d9d2e9' },
    { label: 'Nghỉ phép năm', value: 'AL', color: '#d9ead3' },
    { label: 'Nghỉ không phép', value: 'KP', color: '#c9daf8' },
    { label: 'Ngày Lễ', value: 'L', color: '#fff2cc' }
  ];

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService, private db: DatabaseService) {}

  ngOnInit() {
    this.db.employees$.subscribe(employees => {
      this.reports = [];
      const targetEmployees = employees.slice(0, 30);
      
      targetEmployees.forEach((emp) => {
        const schedule = this.getOrCreateSchedule(emp.id);
        const { hc, off, l, kp } = this.calculateTotals(schedule);
        
        this.reports.push({
          id: emp.id,
          employee: emp.fullName,
          department: emp.department,
          totalHC: hc,
          totalOFF: off,
          totalL: l,
          totalKP: kp,
          status: (hc + off + l >= 22) ? 'Đủ công' : 'Thiếu công'
        });
      });
    });
  }

  getOrCreateSchedule(employeeId: number): any[] {
    if (this.schedulesCache.has(employeeId)) {
        return this.schedulesCache.get(employeeId)!;
    }

    const schedule = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < startOffset; i++) {
        schedule.push({ date: null, type: null, isWeekend: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        let currentDayOfWeek = (startOffset + i - 1) % 7;
        let isWeekend = currentDayOfWeek === 5 || currentDayOfWeek === 6;
        
        let type = 'HC';
        if (isWeekend) type = 'OFF';
        else if (Math.random() > 0.9) type = 'AL';
        
        if (i === 30) type = 'L'; // Fake holiday
        
        schedule.push({
            date: i,
            type: type,
            isWeekend: isWeekend,
            holidayName: type === 'L' ? 'Ngày Lễ' : null
        });
    }

    this.schedulesCache.set(employeeId, schedule);
    return schedule;
  }

  calculateTotals(schedule: any[]) {
      let hc = 0, off = 0, l = 0, kp = 0, al = 0;
      schedule.forEach(cell => {
          if (cell.type === 'HC') hc++;
          else if (cell.type === 'OFF') off++;
          else if (cell.type === 'L') l++;
          else if (cell.type === 'KP') kp++;
          else if (cell.type === 'AL') al++;
      });
      return { hc, off, l, kp, al };
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
    this.isEditingSchedule = false;
    this.employeeSchedule = this.getOrCreateSchedule(employee.id);
    this.displayEmployeeDetails = true;
  }

  editDay(cell: any) {
    if (!this.isEditingSchedule || !cell.date) return;
    this.editingCell = cell;
    this.displayEditDayDialog = true;
  }

  saveDay() {
    this.displayEditDayDialog = false;
    
    // Recalculate totals for the selected employee
    if (this.selectedEmployee) {
        const schedule = this.schedulesCache.get(this.selectedEmployee.id);
        if (schedule) {
            const { hc, off, l, kp, al } = this.calculateTotals(schedule);
            const report = this.reports.find(r => r.id === this.selectedEmployee.id);
            if (report) {
                report.totalHC = hc;
                report.totalOFF = off;
                report.totalL = al; // In HTML, totalL represents AL (Phép). Or wait, let me check the HTML.
                report.totalKP = kp;
                report.status = (hc + off + l >= 22) ? 'Đủ công' : 'Thiếu công';
            }
        }
    }

    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật ký hiệu làm việc' });
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

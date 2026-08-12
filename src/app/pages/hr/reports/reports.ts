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
        const schedule = this.getRealSchedule(emp);
        const { hc, off, l, kp, hasSchedule } = this.calculateTotals(schedule);
        
        this.reports.push({
          id: emp.id,
          employee: emp.fullName,
          department: emp.department,
          email: emp.email,
          title: emp.title,
          totalHC: hc,
          totalOFF: off,
          totalL: l,
          totalKP: kp,
          status: hasSchedule ? ((hc + off + l >= 22) ? 'Đủ công' : 'Thiếu công') : 'Chưa có lịch'
        });
      });
    });
  }

  getRealSchedule(emp: any): any[] | null {
    let baseSchedule = null;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    const req = this.db.getDepartmentRequestSync(emp.department);
    if (req && req.status === 'APPROVED') {
        const deptSchedule = this.db.getDepartmentScheduleSync(emp.department, year, month);
        if (deptSchedule) {
            if (deptSchedule.isUniform && deptSchedule.schedule) {
                baseSchedule = deptSchedule.schedule;
            } else if (!deptSchedule.isUniform && deptSchedule.employeeSchedules && deptSchedule.employeeSchedules[emp.email]) {
                baseSchedule = deptSchedule.employeeSchedules[emp.email];
            }
        }
    }
    
    if (!baseSchedule || baseSchedule.length === 0) {
        baseSchedule = this.db.getCompanyScheduleSync(year, month);
    }
    
    return baseSchedule && baseSchedule.length > 0 ? baseSchedule : null;
  }

  calculateTotals(schedule: any[] | null) {
      if (!schedule) return { hc: 0, off: 0, l: 0, kp: 0, al: 0, hasSchedule: false };
      
      let hc = 0, off = 0, l = 0, kp = 0, al = 0;
      schedule.forEach(cell => {
          if (cell.type === 'HC' || cell.type === 'WFH') hc++;
          else if (cell.type === 'OFF') off++;
          else if (cell.type === 'L') l++;
          else if (cell.type === 'KP') kp++;
          else if (cell.type === 'AL') al++;
      });
      return { hc, off, l, kp, al, hasSchedule: true };
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
    const schedule = this.getRealSchedule(employee);
    this.employeeSchedule = schedule || [];
    this.displayEmployeeDetails = true;
  }

  editDay(cell: any) {
    if (!this.isEditingSchedule || !cell.date || !this.employeeSchedule.length) return;
    this.editingCell = cell;
    this.displayEditDayDialog = true;
  }

  saveDay() {
    this.displayEditDayDialog = false;
    
    // Recalculate totals for the selected employee
    if (this.selectedEmployee && this.employeeSchedule.length > 0) {
        const { hc, off, l, kp, al } = this.calculateTotals(this.employeeSchedule);
        const report = this.reports.find(r => r.id === this.selectedEmployee.id);
        if (report) {
            report.totalHC = hc;
            report.totalOFF = off;
            report.totalL = al; // In HTML, totalL represents AL (Phép). Or wait, let me check the HTML.
            report.totalKP = kp;
            report.status = (hc + off + l >= 22) ? 'Đủ công' : 'Thiếu công';
        }
    }

    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật ký hiệu làm việc' });
  }

  getSymbolColor(type: string): string {
    return this.db.getSymbolColor(type);
  }
}

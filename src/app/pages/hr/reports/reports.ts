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
import { DatabaseService, AttendanceRecord } from '../../../core/services/database.service';

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
  scheduleSource: 'company' | 'dept' | null = null;
  scheduleSourceEmp: any = null;
  
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
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    // Check for report-level override first (for company-schedule employees edited in reports)
    const overrideKey = `report_override_${emp.email}_${year}-${month}`;
    const override = localStorage.getItem(overrideKey);
    if (override) {
      return JSON.parse(override);
    }
    
    let baseSchedule = null;
    
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
    this.scheduleSource = null;
    this.scheduleSourceEmp = employee;
    
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    // Determine schedule source for later saving
    const req = this.db.getDepartmentRequestSync(employee.department);
    if (req && req.status === 'APPROVED') {
      const deptSchedule = this.db.getDepartmentScheduleSync(employee.department, year, month);
      if (deptSchedule && (deptSchedule.schedule || deptSchedule.employeeSchedules)) {
        this.scheduleSource = 'dept';
      } else {
        this.scheduleSource = 'company';
      }
    } else {
      this.scheduleSource = 'company';
    }

    const schedule = this.getRealSchedule(employee);
    const attendanceRecords: AttendanceRecord[] = this.db.getAttendanceRecordsByEmployeeSync(employee.email);
    
    this.employeeSchedule = (schedule || []).map((cell: any) => {
      if (cell.date) {
        const today = new Date();
        // Fix: build local date string without UTC conversion
        const y = today.getFullYear();
        const mo = (today.getMonth() + 1).toString().padStart(2, '0');
        const d = cell.date.toString().padStart(2, '0');
        const dateStr = `${y}-${mo}-${d}`;
        const record = attendanceRecords.find(r => r.date === dateStr);
        return {
          ...cell,
          isShortDay: record?.isShortDay || false,
          checkIn: record?.checkInTime || null,
          checkOut: record?.checkOutTime || null
        };
      }
      return cell;
    });
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
            report.totalL = al;
            report.totalKP = kp;
            report.status = (hc + off + l >= 22) ? 'Đủ công' : 'Thiếu công';
        }
    }

    // Persist the edited schedule back to DB
    if (this.scheduleSourceEmp && this.employeeSchedule.length > 0) {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      
      if (this.scheduleSource === 'dept') {
        const deptSchedule = this.db.getDepartmentScheduleSync(this.scheduleSourceEmp.department, year, month);
        if (deptSchedule) {
          if (deptSchedule.isUniform) {
            deptSchedule.schedule = this.employeeSchedule;
          } else if (deptSchedule.employeeSchedules) {
            deptSchedule.employeeSchedules[this.scheduleSourceEmp.email] = this.employeeSchedule;
          }
          this.db.saveDepartmentSchedule(this.scheduleSourceEmp.department, year, month, deptSchedule);
        }
      } else if (this.scheduleSource === 'company') {
        // For company schedule, we save the modified employee schedule as a new per-employee override
        // To avoid overwriting the whole company schedule, use dept schedule storage with employee-specific
        const overrideKey = `report_override_${this.scheduleSourceEmp.email}_${year}-${month}`;
        localStorage.setItem(overrideKey, JSON.stringify(this.employeeSchedule));
      }
    }

    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật và lưu ký hiệu làm việc' });
  }

  getSymbolColor(type: string): string {
    return this.db.getSymbolColor(type);
  }
}

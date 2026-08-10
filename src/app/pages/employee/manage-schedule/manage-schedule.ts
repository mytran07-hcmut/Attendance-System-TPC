import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatabaseService, DepartmentRequest, ScheduleDay, Employee, DepartmentScheduleData } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-schedule',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, TagModule, SelectButtonModule, FormsModule, TableModule, InputTextModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './manage-schedule.html',
  styleUrl: './manage-schedule.scss'
})
export class ManageSchedule implements OnInit {
  department: string = '';
  pendingRequest: DepartmentRequest | null = null;
  schedule: ScheduleDay[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  fillMode: 'uniform' | 'individual' = 'uniform';
  fillOptions: any[] = [{label: 'Chung toàn phòng', value: 'uniform'}, {label: 'Riêng từng nhân viên', value: 'individual'}];
  departmentEmployees: Employee[] = [];
  employeeSchedules: { [email: string]: ScheduleDay[] } = {};
  selectedEmployeeForSchedule: Employee | null = null;
  
  constructor(private db: DatabaseService, private messageService: MessageService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    const userEmail = user ? user.email : '';
    this.db.employees$.subscribe(emps => {
      const me = emps.find(e => e.email === userEmail);
      if (me) {
        this.department = me.department;
        this.departmentEmployees = emps.filter(e => e.department === this.department);
        this.db.deptRequests$.subscribe(requests => {
          this.pendingRequest = requests[this.department] || null;
          const saved = this.db.getDepartmentScheduleSync(this.department);
          
          if (saved) {
             this.fillMode = saved.isUniform ? 'uniform' : 'individual';
             if (saved.isUniform && saved.schedule) {
                 this.schedule = saved.schedule;
             } else if (!saved.isUniform && saved.employeeSchedules) {
                 this.employeeSchedules = saved.employeeSchedules;
             }
          } else if (this.pendingRequest && this.pendingRequest.status === 'PENDING_HEAD') {
             this.generateDefaultSchedule();
          }
        });
      }
    });
  }

  generateDefaultSchedule() {
    const companySched = this.db.getCompanyScheduleSync();
    let defaultSched: ScheduleDay[] = [];
    if (companySched && companySched.length > 0) {
       defaultSched = JSON.parse(JSON.stringify(companySched));
    } else {
       const today = new Date();
       const year = this.pendingRequest?.year || today.getFullYear();
       const month = this.pendingRequest?.month ? this.pendingRequest.month - 1 : today.getMonth();
       const firstDay = new Date(year, month, 1).getDay();
       const daysInMonth = new Date(year, month + 1, 0).getDate();
       let startOffset = firstDay === 0 ? 6 : firstDay - 1;
       
       for (let i = 0; i < startOffset; i++) {
         defaultSched.push({ date: null, type: '' });
       }
       for (let i = 1; i <= daysInMonth; i++) {
         const dow = (startOffset + i - 1) % 7;
         defaultSched.push({ date: i, type: (dow === 5 || dow === 6) ? 'OFF' : 'HC' });
       }
    }

    this.schedule = JSON.parse(JSON.stringify(defaultSched));
    
    this.departmentEmployees.forEach(emp => {
        this.employeeSchedules[emp.email] = JSON.parse(JSON.stringify(defaultSched));
    });
  }

  toggleDay(day: ScheduleDay) {
    if (!day.date) return;
    if (this.pendingRequest?.status !== 'PENDING_HEAD') return;
    day.type = day.type === 'HC' ? 'WFH' : (day.type === 'WFH' ? 'OFF' : 'HC');
  }

  applyToAllWeekdays(day: ScheduleDay, scheduleArray: ScheduleDay[], event: Event) {
    event.stopPropagation();
    if (!day.date || this.pendingRequest?.status !== 'PENDING_HEAD') return;

    const index = scheduleArray.indexOf(day);
    if (index === -1) return;

    const dow = index % 7;
    scheduleArray.forEach((d, i) => {
      if (i % 7 === dow && d.date !== null) {
        d.type = day.type;
      }
    });

    this.messageService.add({ severity: 'info', summary: 'Đã sao chép', detail: 'Đã áp dụng lịch cho tất cả ngày thứ này trong tháng' });
  }

  selectEmployee(emp: Employee) {
      this.selectedEmployeeForSchedule = emp;
  }

  backToEmployeeList() {
      this.selectedEmployeeForSchedule = null;
  }

  submitSchedule() {
    const payload: DepartmentScheduleData = {
        isUniform: this.fillMode === 'uniform',
        schedule: this.fillMode === 'uniform' ? this.schedule : undefined,
        employeeSchedules: this.fillMode === 'individual' ? this.employeeSchedules : undefined
    };
    this.db.saveDepartmentSchedule(this.department, payload);
    this.db.updateDepartmentRequest(this.department, 'PENDING_HR');
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã gửi lịch cho HR duyệt' });
  }
}

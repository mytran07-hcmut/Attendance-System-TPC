import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatabaseService, DepartmentRequest, ScheduleDay } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-schedule',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, TagModule],
  providers: [MessageService],
  templateUrl: './manage-schedule.html',
  styleUrl: './manage-schedule.scss'
})
export class ManageSchedule implements OnInit {
  department: string = '';
  pendingRequest: DepartmentRequest | null = null;
  schedule: ScheduleDay[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  constructor(private db: DatabaseService, private messageService: MessageService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    const userEmail = user ? user.email : '';
    this.db.employees$.subscribe(emps => {
      const me = emps.find(e => e.email === userEmail);
      if (me) {
        this.department = me.department;
        this.db.deptRequests$.subscribe(requests => {
          this.pendingRequest = requests[this.department] || null;
          if (this.pendingRequest && this.pendingRequest.status === 'PENDING_HEAD') {
             this.generateDefaultSchedule();
          } else if (this.pendingRequest && (this.pendingRequest.status === 'PENDING_HR' || this.pendingRequest.status === 'APPROVED')) {
             const saved = this.db.getDepartmentScheduleSync(this.department);
             if (saved) {
               this.schedule = saved;
             }
          }
        });
      }
    });
  }

  generateDefaultSchedule() {
    const companySched = this.db.getCompanyScheduleSync();
    if (companySched && companySched.length > 0) {
       this.schedule = JSON.parse(JSON.stringify(companySched));
    } else {
       this.schedule = [];
       const today = new Date();
       const year = today.getFullYear();
       const month = today.getMonth();
       const firstDay = new Date(year, month, 1).getDay();
       const daysInMonth = new Date(year, month + 1, 0).getDate();
       let startOffset = firstDay === 0 ? 6 : firstDay - 1;
       
       for (let i = 0; i < startOffset; i++) {
         this.schedule.push({ date: null, type: '' });
       }
       for (let i = 1; i <= daysInMonth; i++) {
         const dow = (startOffset + i - 1) % 7;
         this.schedule.push({ date: i, type: (dow === 5 || dow === 6) ? 'OFF' : 'HC' });
       }
    }
  }

  toggleDay(day: ScheduleDay) {
    if (!day.date) return;
    if (this.pendingRequest?.status !== 'PENDING_HEAD') return;
    day.type = day.type === 'HC' ? 'OFF' : 'HC';
  }

  submitSchedule() {
    this.db.saveDepartmentSchedule(this.department, this.schedule);
    this.db.updateDepartmentRequest(this.department, 'PENDING_HR');
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã gửi lịch cho HR duyệt' });
  }
}

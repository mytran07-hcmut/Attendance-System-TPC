import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-employee-leave',
  standalone: true,
  imports: [CommonModule, RouterModule, SelectModule, TextareaModule, DatePickerModule, ButtonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './leave.html',
  styleUrl: './leave.scss'
})
export class Leave implements OnInit {
  leaveTypes = [
    { label: 'Nghỉ phép năm (AL)', value: 'AL' },
    { label: 'Nghỉ ốm', value: 'SICK' },
    { label: 'Nghỉ việc riêng có lương', value: 'PAID' },
    { label: 'Nghỉ không lương (KP)', value: 'KP' }
  ];

  selectedType: any = null;
  dateRange: Date[] | undefined;
  reason: string = '';

  constructor(
    private messageService: MessageService, 
    private router: Router,
    private db: DatabaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (history.state && history.state.targetDate) {
      const targetDateStr = history.state.targetDate;
      const [day, month, year] = targetDateStr.split('/');
      if (day && month && year) {
        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
        this.dateRange = [parsedDate, parsedDate];
      }
    }
  }


  submitLeaveRequest() {
    if (!this.selectedType || !this.dateRange || this.dateRange.length === 0 || !this.reason) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;
    
    // Convert dates to ISO strings for DB
    const dates = this.dateRange.map(d => d ? d.toISOString() : null).filter(d => d !== null) as string[];

    const employees = this.db.getEmployeesSync();
    const me = employees.find(e => e.email === user.email);
    if (!me) return;

    this.db.addLeaveRequest({
      employeeEmail: me.email,
      employeeName: me.fullName,
      department: me.department,
      typeCode: this.selectedType.value,
      typeLabel: this.selectedType.label,
      reason: this.reason,
      dateRange: dates,
      status: 'PENDING',
      requestDate: new Date().toISOString()
    });

    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đơn xin nghỉ phép đã được gửi đến HR' });
    
    // Redirect về Attendance sau 2 giây
    setTimeout(() => {
        this.router.navigate(['/employee/attendance']);
    }, 2000);
  }
}

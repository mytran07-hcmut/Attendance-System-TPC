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

  constructor(private messageService: MessageService, private router: Router) {}

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
    if (!this.selectedType || !this.dateRange || !this.reason) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đơn xin nghỉ phép đã được gửi đến HR' });
    
    // Giả lập redirect về Attendance sau 2 giây với state
    setTimeout(() => {
        this.router.navigate(['/employee/attendance'], { 
            state: { 
                leaveSubmitted: true, 
                reason: this.reason,
                dateRange: this.dateRange 
            } 
        });
    }, 2000);
  }
}

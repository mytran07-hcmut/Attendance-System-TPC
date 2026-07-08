import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepsModule } from 'primeng/steps';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-hr-schedule',
  standalone: true,
  imports: [CommonModule, StepsModule, SelectModule, ButtonModule, FormsModule, CheckboxModule, ToastModule, DatePickerModule],
  providers: [MessageService],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss'
})
export class Schedule {
  items: MenuItem[] = [
    { label: 'Chọn đối tượng' },
    { label: 'Thiết lập & Phân quyền' },
    { label: 'Xem trước & Đăng lịch' }
  ];
  activeIndex: number = 0;

  options = [
    { label: 'Toàn công ty (Option 1)', value: 1 },
    { label: 'Theo phòng ban (Option 2)', value: 2 },
    { label: 'Nhân viên đặc biệt (Option 3)', value: 3 }
  ];
  selectedOption: number = 1;

  departments = [{name: 'IT'}, {name: 'Kế toán'}, {name: 'Nhân sự'}];
  selectedDepartment: any;

  employees = [{name: 'Nguyễn Văn A'}, {name: 'Trần Thị B'}];
  selectedEmployee: any;

  // Calendar setup
  currentMonth = new Date();
  monthDays: any[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  constructor(private messageService: MessageService) {
    this.generateCalendar();
  }

  next() {
    if (this.activeIndex < 2) {
      this.activeIndex++;
      if (this.activeIndex === 2) {
         this.generateCalendar();
      }
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  publish() {
    this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Đã tạo và đăng lịch làm việc!'});
    if (this.selectedOption === 2 || this.selectedOption === 3) {
      setTimeout(() => {
        this.messageService.add({severity: 'info', summary: 'Thông báo', detail: 'Đã gửi thông báo yêu cầu điền lịch tới Trưởng phòng/Nhân viên'});
      }, 1000);
    }
    setTimeout(() => {
       this.activeIndex = 0;
    }, 2500);
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (JS getDay: 0=Sun, 1=Mon)
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    this.monthDays = [];
    
    // Empty slots
    for (let i = 0; i < startOffset; i++) {
      this.monthDays.push({ date: null, type: '' });
    }
    
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let type = isWeekend ? 'OFF' : 'HC';

      // Specific overrides if needed
      if (this.selectedOption === 2 && !isWeekend) type = '?'; // Wait for manager
      if (this.selectedOption === 3 && !isWeekend) type = '?'; // Wait for employee

      this.monthDays.push({
        date: i,
        type: type,
        isWeekend: isWeekend
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StepsModule } from 'primeng/steps';
import { SelectModule } from 'primeng/select';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-hr-schedule',
  standalone: true,
  imports: [CommonModule, StepsModule, SelectModule, CascadeSelectModule, ButtonModule, FormsModule, CheckboxModule, ToastModule, DatePickerModule, DialogModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss'
})
export class Schedule implements OnInit {
  items: MenuItem[] = [
    { label: 'Chọn đối tượng' },
    { label: 'Thiết lập & Phân quyền' },
    { label: 'Xem trước & Đăng lịch' }
  ];
  activeIndex: number = 0;
  viewState: 'calendar' | 'wizard' = 'calendar';
  availableSymbols = [
    { code: 'HC', name: 'Hành chính', color: '#f4cccc' },
    { code: 'AL', name: 'Nghỉ phép năm', color: '#d9ead3' },
    { code: 'KP', name: 'Nghỉ không phép', color: '#c9daf8' },
    { code: 'OFF', name: 'Ngày nghỉ tuần', color: '#d9d2e9' },
    { code: 'L', name: 'Ngày Lễ', color: '#fff2cc' }
  ];
  displayEditDialog: boolean = false;
  editingCell: any = null;
  tempSymbol: any = null;
  tempHolidayName: string = '';



  scopeOptions = [
    { label: 'Toàn công ty', code: 'ALL' },
    { 
      label: 'Theo phòng ban', 
      code: 'DEP',
      items: [
        { label: 'Phòng IT', code: 'IT' },
        { label: 'Phòng Kế toán', code: 'ACC' },
        { label: 'Phòng Nhân sự', code: 'HR' }
      ]
    }
  ];
  selectedScope: any = this.scopeOptions[0];

  options = [
    { label: 'Toàn công ty', value: 1 },
    { label: 'Theo phòng ban', value: 2 },
    { label: 'Nhân viên đặc biệt', value: 3 }
  ];
  selectedOption: number = 1;

  departments = [{ name: 'IT' }, { name: 'Kế toán' }, { name: 'Nhân sự' }];
  selectedDepartment: any;

  employees = [{ name: 'Nguyễn Văn A' }, { name: 'Trần Thị B' }];
  selectedEmployee: any;

  // Calendar setup
  currentMonth = new Date();
  monthDays: any[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  constructor(private messageService: MessageService, private route: ActivatedRoute) {
    this.generateCalendar();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        this.viewState = 'wizard';
        this.activeIndex = 0;
      }
    });
  }

  openEditDialog(cell: any) {
    if (!cell.date) return;
    this.editingCell = cell;
    this.tempSymbol = this.availableSymbols.find(s => s.code === cell.type) || this.availableSymbols[0];
    this.tempHolidayName = cell.holidayName || '';
    this.displayEditDialog = true;
  }

  saveCell() {
    if (this.editingCell) {
      this.editingCell.type = this.tempSymbol.code;
      if (this.tempSymbol.code === 'L') {
        this.editingCell.holidayName = this.tempHolidayName;
      } else {
        this.editingCell.holidayName = '';
      }
    }
    this.displayEditDialog = false;
  }

  getSymbolColor(code: string): string {
    const symbol = this.availableSymbols.find(s => s.code === code);
    return symbol ? symbol.color : '#fff3cd';
  }

  openWizard() {
    this.viewState = 'wizard';
    this.activeIndex = 0;
    this.selectedOption = 1;
  }

  cancelWizard() {
    this.viewState = 'calendar';
    this.activeIndex = 0;
    this.selectedOption = 1;
    this.generateCalendar();
  }

  onMonthSelect() {
    this.generateCalendar();
  }

  onScopeChange(event: any) {
    // Re-generate calendar with mock data based on the selected scope
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
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo và đăng lịch làm việc!' });
    if (this.selectedOption === 2 || this.selectedOption === 3) {
      setTimeout(() => {
        this.messageService.add({ severity: 'info', summary: 'Thông báo', detail: 'Đã gửi thông báo yêu cầu điền lịch tới Trưởng phòng/Nhân viên' });
      }, 1000);
    }
    setTimeout(() => {
      this.activeIndex = 0;
      this.viewState = 'calendar';
      this.selectedOption = 1;
      this.generateCalendar();
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

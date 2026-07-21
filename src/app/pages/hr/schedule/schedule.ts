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
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatabaseService, Employee } from '../../../core/services/database.service';

@Component({
  selector: 'app-hr-schedule',
  standalone: true,
  imports: [CommonModule, StepsModule, SelectModule, CascadeSelectModule, ButtonModule, FormsModule, CheckboxModule, ToastModule, DatePickerModule, DialogModule, InputTextModule, TooltipModule, TableModule, TagModule, IconFieldModule, InputIconModule],
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
  viewState: 'calendar' | 'wizard' | 'employeeList' | 'employeeCalendar' = 'calendar';
  isScheduleCreated: boolean = true;
  isEditMode: boolean = false;
  totalEmployeeWorkDays: number = 0;
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

  // Day Details dialog
  displayDayDetailsDialog: boolean = false;
  selectedDayDetails: any = null;
  absentList: any[] = [];
  lateList: any[] = [];

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
    },
    { label: 'Nhân viên', code: 'EMP' }
  ];
  selectedScope: any = this.scopeOptions[0];
  searchText: string = '';

  options = [
    { label: 'Toàn công ty', value: 1 },
    { label: 'Theo phòng ban', value: 2 },
    { label: 'Nhân viên đặc biệt', value: 3 }
  ];
  selectedOption: number = 1;

  departments = [{ name: 'IT' }, { name: 'Kế toán' }, { name: 'Nhân sự' }];
  selectedDepartment: any;

  employees: Employee[] = [];
  selectedEmployee: any;

  // Calendar setup
  currentMonth = new Date();
  monthDays: any[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  constructor(private messageService: MessageService, private route: ActivatedRoute, private db: DatabaseService) {
    this.generateCalendar();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        this.viewState = 'wizard';
        this.activeIndex = 0;
      }
    });
    this.db.employees$.subscribe(data => {
      this.employees = data;
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  onCellClick(cell: any) {
    if (this.isEditMode) {
      if (!cell.isPast && cell.date) {
        this.openEditDialog(cell);
      }
    } else {
      this.viewDayDetails(cell);
    }
  }

  viewDayDetails(cell: any) {
    if (!cell || !cell.date || (!cell.absentCount && !cell.lateCount)) {
      return;
    }

    this.selectedDayDetails = cell;
    
    // Randomize absent list
    const shuffledAbsents = [...this.employees].sort(() => 0.5 - Math.random());
    this.absentList = shuffledAbsents.slice(0, cell.absentCount).map(emp => ({
      ...emp,
      leaveType: Math.random() > 0.3 ? 'Có phép' : 'Không phép'
    }));

    // Randomize late list (late is after 09:30)
    const shuffledLates = [...this.employees].sort(() => 0.5 - Math.random());
    this.lateList = shuffledLates.slice(0, cell.lateCount).map(emp => {
      const hour = 9 + Math.floor(Math.random() * 2); // 09 or 10
      const minute = hour === 9 ? 31 + Math.floor(Math.random() * 29) : Math.floor(Math.random() * 30);
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      return {
        ...emp,
        checkInTime: timeStr
      };
    });

    this.displayDayDetailsDialog = true;
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
      if (this.viewState === 'employeeCalendar') {
        this.calculateTotalWorkDays();
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

  checkScheduleCreated() {
    const today = new Date();
    const isFutureMonth = this.currentMonth.getFullYear() > today.getFullYear() || 
                          (this.currentMonth.getFullYear() === today.getFullYear() && this.currentMonth.getMonth() > today.getMonth());
    this.isScheduleCreated = !isFutureMonth;
  }

  onMonthSelect() {
    this.checkScheduleCreated();
    this.generateCalendar();
  }

  onScopeChange(event: any) {
    if (this.selectedScope?.code === 'EMP') {
      this.viewState = 'employeeList';
    } else {
      this.viewState = 'calendar';
      this.generateCalendar();
    }
  }

  selectEmployeeForCalendar(emp: Employee) {
    this.selectedEmployee = emp;
    this.viewState = 'employeeCalendar';
    this.generateCalendar();
    this.calculateTotalWorkDays();
  }

  calculateTotalWorkDays() {
    this.totalEmployeeWorkDays = this.monthDays.filter(d => d.date && d.type === 'HC').length;
  }

  saveEmployeeCalendar() {
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật lịch làm việc cho ' + this.selectedEmployee.fullName });
    this.viewState = 'employeeList';
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
    this.checkScheduleCreated();
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
      
      let absentCount = 0;
      let lateCount = 0;
      // Generate some mock absent/late data for past days when viewing entire company
      let isToday = false;
      let isPast = false;
      
      const today = new Date();
      if (year === today.getFullYear() && month === today.getMonth()) {
        isToday = i === today.getDate();
        isPast = i < today.getDate();
      } else if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth())) {
        isPast = true;
      }

      if (this.viewState === 'calendar' && this.isScheduleCreated && !isWeekend && isPast) {
        absentCount = Math.floor(Math.random() * 5); // 0-4
        lateCount = Math.floor(Math.random() * 10); // 0-9
      }

      this.monthDays.push({
        date: i,
        type: type,
        isWeekend: isWeekend,
        isPast: isPast,
        isToday: isToday,
        absentCount: absentCount,
        lateCount: lateCount
      });
    }
  }
}

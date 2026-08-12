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
import { DatabaseService, Employee, DepartmentRequest, DepartmentScheduleData, ScheduleDay, ScheduleSymbol, AttendanceRecord } from '../../../core/services/database.service';

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
  availableSymbols: ScheduleSymbol[] = [];
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
        { label: 'Phòng Nhân sự', code: 'HR' },
        { label: 'Phòng Kế toán', code: 'ACC' },
        { label: 'Phòng Marketing', code: 'MKT' },
        { label: 'Phòng Sales', code: 'SALES' },
        { label: 'Ban Giám đốc', code: 'BOD' }
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

  departments = [
    { name: 'Phòng IT' },
    { name: 'Phòng Nhân sự' },
    { name: 'Phòng Kế toán' },
    { name: 'Phòng Marketing' },
    { name: 'Phòng Sales' },
    { name: 'Ban Giám đốc' }
  ];
  selectedDepartment: any;

  employees: Employee[] = [];
  selectedEmployee: any;

  currentDeptRequest: DepartmentRequest | null = null;
  deptScheduleData: DepartmentScheduleData | null = null;
  departmentEmployees: Employee[] = [];

  // Calendar setup
  currentMonth = new Date();
  minDate: Date;
  monthDays: any[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  constructor(private messageService: MessageService, private route: ActivatedRoute, private db: DatabaseService) {
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.generateCalendar();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        this.openWizard();
      }
    });
    this.db.employees$.subscribe(data => {
      this.employees = data;
    });
    this.db.symbols$.subscribe(data => {
      this.availableSymbols = data;
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

      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth() + 1;

      if (this.viewState === 'employeeCalendar') {
        this.calculateTotalWorkDays();
        // Persist the change back to DB
        if (this.deptScheduleData && this.selectedEmployee) {
          // monthDays references deptScheduleData.schedule or employeeSchedules[email] directly,
          // so the in-memory object is already mutated. We just need to save it.
          this.db.saveDepartmentSchedule(this.selectedEmployee.department, year, month, this.deptScheduleData);
        } else {
          // Fallback: save to company schedule
          this.db.saveCompanySchedule(year, month, this.monthDays);
        }
        this.messageService.add({ severity: 'success', summary: 'Đã lưu', detail: 'Ký hiệu ngày làm việc đã được cập nhật', life: 2000 });
      } else if (this.viewState === 'calendar' && this.selectedScope?.code === 'ALL') {
        this.db.saveCompanySchedule(year, month, this.monthDays);
      }
    }
    this.displayEditDialog = false;
  }

  getSymbolColor(code: string): string {
    return this.db.getSymbolColor(code);
  }

  openWizard() {
    this.viewState = 'wizard';
    this.activeIndex = 0;
    this.selectedOption = 1;
    
    // Set to current month when opening wizard to create new schedule
    const today = new Date();
    this.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.generateCalendar();
  }

  cancelWizard() {
    this.viewState = 'calendar';
    this.activeIndex = 0;
    this.selectedOption = 1;
    this.generateCalendar();
  }

  checkScheduleCreated() {
    const key = `${this.currentMonth.getFullYear()}-${this.currentMonth.getMonth() + 1}`;
    const published = this.db.getPublishedMonthsSync();
    
    if (published.includes(key)) {
        this.isScheduleCreated = true;
    } else {
        const today = new Date();
        const isFutureMonth = this.currentMonth.getFullYear() > today.getFullYear() || 
                              (this.currentMonth.getFullYear() === today.getFullYear() && this.currentMonth.getMonth() > today.getMonth());
        this.isScheduleCreated = !isFutureMonth;
    }
  }

  onMonthSelect() {
    this.checkScheduleCreated();
    this.generateCalendar();
  }

  onScopeChange(event: any) {
    if (this.selectedScope?.code === 'EMP') {
      this.viewState = 'employeeList';
      this.currentDeptRequest = null;
      this.deptScheduleData = null;
    } else {
      this.viewState = 'calendar';
      if (this.selectedScope?.code !== 'ALL' && this.selectedScope?.code !== 'EMP') {
         const deptName = this.selectedScope.label;
         this.currentDeptRequest = this.db.getDepartmentRequestSync(deptName);
         if (this.currentDeptRequest) {
             this.deptScheduleData = this.db.getDepartmentScheduleSync(deptName, this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
         } else {
             this.deptScheduleData = null;
         }
         this.departmentEmployees = this.employees.filter(e => e.department === deptName);
      } else {
         this.currentDeptRequest = null;
         this.deptScheduleData = null;
      }
      this.generateCalendar();
    }
  }

  approveSchedule() {
     if (this.currentDeptRequest) {
         this.db.updateDepartmentRequest(this.currentDeptRequest.department, 'APPROVED');
         this.currentDeptRequest.status = 'APPROVED';
         this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã duyệt và đăng lịch cho phòng ' + this.currentDeptRequest.department });
     }
  }

  rejectSchedule() {
     if (this.currentDeptRequest) {
         this.db.updateDepartmentRequest(this.currentDeptRequest.department, 'PENDING_HEAD');
         this.currentDeptRequest.status = 'PENDING_HEAD';
         this.messageService.add({ severity: 'info', summary: 'Đã từ chối', detail: 'Đã yêu cầu Trưởng phòng ' + this.currentDeptRequest.department + ' điền lại lịch' });
     }
  }

  selectEmployeeForCalendar(emp: Employee) {
    this.selectedEmployee = emp;
    this.viewState = 'employeeCalendar';
    this.currentDeptRequest = this.db.getDepartmentRequestSync(emp.department);
    this.deptScheduleData = this.db.getDepartmentScheduleSync(emp.department, this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    this.generateCalendar();
    this.overlayAttendanceData();
    this.calculateTotalWorkDays();
  }

  overlayAttendanceData() {
    if (!this.selectedEmployee || this.viewState !== 'employeeCalendar') return;
    
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const today = new Date();
    const records: AttendanceRecord[] = this.db.getAttendanceRecordsByEmployeeSync(this.selectedEmployee.email);
    
    this.monthDays = this.monthDays.map(cell => {
      if (!cell.date) return cell;
      
      // Fix: use local date string (not toISOString which converts to UTC and shifts the day in UTC+7)
      const d = cell.date.toString().padStart(2, '0');
      const m = (month + 1).toString().padStart(2, '0');
      const dateStr = `${year}-${m}-${d}`;
      const record = records.find(r => r.date === dateStr);
      
      // Recalculate isToday and isPast based on actual current date (fix stale stored values)
      const isToday = year === today.getFullYear() && month === today.getMonth() && cell.date === today.getDate();
      const isPast = (year < today.getFullYear()) ||
                     (year === today.getFullYear() && month < today.getMonth()) ||
                     (year === today.getFullYear() && month === today.getMonth() && cell.date < today.getDate());
      
      return {
        ...cell,
        isToday,
        isPast,
        checkIn: record?.checkInTime || null,
        checkOut: record?.checkOutTime || null,
        isShortDay: record?.isShortDay || false
      };
    });
  }

  calculateTotalWorkDays() {
    this.totalEmployeeWorkDays = this.monthDays.filter(d => d.date && d.type === 'HC').length;
  }

  saveEmployeeCalendar() {
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật lịch làm việc cho ' + this.selectedEmployee.fullName });
    if (this.deptScheduleData && !this.deptScheduleData.isUniform) {
       this.viewState = 'calendar';
    } else {
       this.viewState = 'employeeList';
    }
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
    if (this.selectedOption === 1) {
      this.db.saveCompanySchedule(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, this.monthDays);
      this.db.publishMonth(this.currentMonth.getFullYear(), this.currentMonth.getMonth());
      this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo và đăng lịch làm việc toàn công ty!' });
    } else if (this.selectedOption === 2) {
      if (this.selectedDepartment && this.selectedDepartment.name) {
        this.db.updateDepartmentRequest(this.selectedDepartment.name, 'PENDING_HEAD', this.currentMonth.getMonth() + 1, this.currentMonth.getFullYear());
        this.messageService.add({ severity: 'info', summary: 'Thông báo', detail: `Đã gửi yêu cầu điền lịch tới Trưởng phòng ${this.selectedDepartment.name}` });
      }
    } else {
      this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo và đăng lịch làm việc!' });
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

    // If viewing a department that has a uniform schedule, we can load it here
    if (this.deptScheduleData && this.deptScheduleData.isUniform && this.deptScheduleData.schedule) {
        this.monthDays = this.deptScheduleData.schedule;
        return;
    }

    // If viewing an employee calendar and the manager filled it individually
    if (this.viewState === 'employeeCalendar' && this.deptScheduleData && !this.deptScheduleData.isUniform && this.selectedEmployee) {
        if (this.deptScheduleData.employeeSchedules && this.deptScheduleData.employeeSchedules[this.selectedEmployee.email]) {
            this.monthDays = this.deptScheduleData.employeeSchedules[this.selectedEmployee.email];
            return;
        }
    }

    let companySched: ScheduleDay[] = [];
    if (this.isScheduleCreated) {
        companySched = this.db.getCompanyScheduleSync(year, month + 1) || [];
    }

    // Empty slots
    for (let i = 0; i < startOffset; i++) {
      this.monthDays.push({ date: null, type: '' });
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let type = isWeekend ? 'OFF' : 'HC';
      let holidayName = '';

      if (companySched.length > 0 && companySched[startOffset + i - 1]) {
          type = companySched[startOffset + i - 1].type;
          holidayName = companySched[startOffset + i - 1].holidayName || '';
      } else {
          // Specific overrides if needed
          if (this.selectedOption === 2 && !isWeekend) type = '?'; // Wait for manager
          if (this.selectedOption === 3 && !isWeekend) type = '?'; // Wait for employee
      }
      
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
        holidayName: holidayName,
        isWeekend: isWeekend,
        isPast: isPast,
        isToday: isToday,
        absentCount: absentCount,
        lateCount: lateCount
      });
    }
  }
}

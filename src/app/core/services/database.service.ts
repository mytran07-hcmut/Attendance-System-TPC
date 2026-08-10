import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EMPLOYEES_MOCK } from '../mocks/employees.mock';

export interface Employee {
  id: number;
  code: string;
  fullName: string;
  department: string;
  title: string;
  email: string;
  phone?: string;
  status?: string;
  avatar?: string;
  permissions?: string[];
}

export interface ScheduleDay {
  date: number | null;
  type: string;
  isWeekend?: boolean;
  holidayName?: string;
}

export interface DepartmentScheduleData {
  isUniform: boolean;
  schedule?: ScheduleDay[];
  employeeSchedules?: { [email: string]: ScheduleDay[] };
}

export interface DepartmentRequest {
  department: string;
  status: 'PENDING_HEAD' | 'PENDING_HR' | 'APPROVED';
  month?: number;
  year?: number;
  approvedEmployees?: string[];
}

export interface LeaveRequest {
  id: number;
  employeeEmail: string;
  employeeName: string;
  department: string;
  typeCode: string;
  typeLabel: string;
  reason: string;
  dateRange: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}

export interface ScheduleSymbol {
  code: string;
  name: string;
  color: string;
  description: string;
}

const DEFAULT_SYMBOLS: ScheduleSymbol[] = [
  { code: 'HC', name: 'Hành chính (Đi làm đủ)', color: '#f4cccc', description: 'Áp dụng khi nhân viên đến văn phòng/nhà máy làm việc và check-in đủ ca tiêu chuẩn (thường là 8 tiếng).' },
  { code: 'AL', name: 'Nghỉ phép năm', color: '#d9ead3', description: 'Áp dụng khi nhân viên chủ động xin nghỉ giải quyết việc riêng, đi du lịch... và số ngày nghỉ được trừ trực tiếp vào Quỹ phép năm còn lại của họ.' },
  { code: 'KP', name: 'Nghỉ không phép', color: '#c9daf8', description: 'Áp dụng khi nhân viên tự ý bỏ việc không thông báo, gọi điện không bắt máy. Ký hiệu này dùng làm căn cứ xử lý kỷ luật hoặc trừ điểm chuyên cần.' },
  { code: 'OFF', name: 'Ngày nghỉ tuần', color: '#d9d2e9', description: 'Áp dụng cho ngày nghỉ mặc định trong tuần (thường là Chủ Nhật), hoặc ngày nghỉ xoay ca linh hoạt của nhân viên khối dịch vụ/cửa hàng.' },
  { code: 'L', name: 'Nghỉ Lễ, Tết', color: '#fff2cc', description: 'Hệ thống tự động áp dụng cho toàn công ty vào các ngày quốc lễ (Tết Âm/Dương lịch, 30/4, 1/5, Quốc khánh 2/9, Giỗ tổ Hùng Vương).' },
  { code: 'WFH', name: 'Làm việc tại nhà', color: '#ffe5b4', description: 'Áp dụng khi nhân viên được cho phép làm việc từ xa (Work From Home).' }
];

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly EMPLOYEES_KEY = 'mock_db_employees_v2';
  private readonly COMPANY_SCHEDULE_KEY = 'mock_db_company_schedule';
  private readonly DEPT_SCHEDULES_KEY = 'mock_db_dept_schedules';
  private readonly DEPT_REQUESTS_KEY = 'mock_db_dept_requests';
  private readonly LEAVE_REQUESTS_KEY = 'mock_db_leave_requests';
  private readonly SYMBOLS_KEY = 'mock_db_symbols';
  
  private symbolsSubject = new BehaviorSubject<ScheduleSymbol[]>([]);
  public symbols$ = this.symbolsSubject.asObservable();
  
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  private companyScheduleSubject = new BehaviorSubject<{ [monthYear: string]: ScheduleDay[] }>({});
  public companySchedule$ = this.companyScheduleSubject.asObservable();

  private deptSchedulesSubject = new BehaviorSubject<{ [dept_monthYear: string]: DepartmentScheduleData }>({});
  public deptSchedules$ = this.deptSchedulesSubject.asObservable();

  private deptRequestsSubject = new BehaviorSubject<{ [dept: string]: DepartmentRequest }>({});
  public deptRequests$ = this.deptRequestsSubject.asObservable();

  private publishedMonthsSubject = new BehaviorSubject<string[]>([]);
  public publishedMonths$ = this.publishedMonthsSubject.asObservable();

  private leaveRequestsSubject = new BehaviorSubject<LeaveRequest[]>([]);
  public leaveRequests$ = this.leaveRequestsSubject.asObservable();

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    const storedEmployees = localStorage.getItem(this.EMPLOYEES_KEY);
    if (storedEmployees) {
      this.employeesSubject.next(JSON.parse(storedEmployees));
    } else {
      const initialData: Employee[] = EMPLOYEES_MOCK.map((emp: any) => ({
        ...emp,
        phone: emp.phone || '0901234567',
        status: emp.status || 'Làm việc'
      }));
      this.saveEmployees(initialData);
    }

    const storedCompanySchedule = localStorage.getItem(this.COMPANY_SCHEDULE_KEY);
    if (storedCompanySchedule) {
      try {
        const parsed = JSON.parse(storedCompanySchedule);
        if (Array.isArray(parsed)) {
            // Legacy data, clear it
            this.companyScheduleSubject.next({});
        } else {
            this.companyScheduleSubject.next(parsed);
        }
      } catch (e) { this.companyScheduleSubject.next({}); }
    }

    const storedDeptSchedules = localStorage.getItem(this.DEPT_SCHEDULES_KEY);
    if (storedDeptSchedules) {
      try {
        const parsed = JSON.parse(storedDeptSchedules);
        // Check if old format by seeing if keys are just department names without year-month
        this.deptSchedulesSubject.next(parsed);
      } catch (e) { this.deptSchedulesSubject.next({}); }
    }

    const storedDeptRequests = localStorage.getItem(this.DEPT_REQUESTS_KEY);
    if (storedDeptRequests) {
      this.deptRequestsSubject.next(JSON.parse(storedDeptRequests));
    }

    const storedLeaveRequests = localStorage.getItem(this.LEAVE_REQUESTS_KEY);
    if (storedLeaveRequests) {
      this.leaveRequestsSubject.next(JSON.parse(storedLeaveRequests));
    }

    const storedPublishedMonths = localStorage.getItem('mock_db_published_months');
    if (storedPublishedMonths) {
      this.publishedMonthsSubject.next(JSON.parse(storedPublishedMonths));
    } else {
      // Default to current month and previous month
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const prevMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
      this.publishedMonthsSubject.next([prevMonthKey, currentMonthKey]);
    }

    const storedLeave = localStorage.getItem(this.LEAVE_REQUESTS_KEY);
    if (storedLeave) {
      this.leaveRequestsSubject.next(JSON.parse(storedLeave));
    }
    
    const storedSymbols = localStorage.getItem(this.SYMBOLS_KEY);
    if (storedSymbols) {
      this.symbolsSubject.next(JSON.parse(storedSymbols));
    } else {
      this.symbolsSubject.next([...DEFAULT_SYMBOLS.map(s => ({...s}))]);
    }

    // Listen to changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === this.EMPLOYEES_KEY && event.newValue) {
        this.employeesSubject.next(JSON.parse(event.newValue));
      }
      if (event.key === this.COMPANY_SCHEDULE_KEY && event.newValue) {
        this.companyScheduleSubject.next(JSON.parse(event.newValue));
      }
      if (event.key === this.DEPT_SCHEDULES_KEY && event.newValue) {
        this.deptSchedulesSubject.next(JSON.parse(event.newValue));
      }
      if (event.key === this.DEPT_REQUESTS_KEY && event.newValue) {
        this.deptRequestsSubject.next(JSON.parse(event.newValue));
      }
      if (event.key === this.LEAVE_REQUESTS_KEY && event.newValue) {
        this.leaveRequestsSubject.next(JSON.parse(event.newValue));
      }
      if (event.key === this.SYMBOLS_KEY && event.newValue) {
        this.symbolsSubject.next(JSON.parse(event.newValue));
      }
      if (event.key === 'mock_db_published_months' && event.newValue) {
        this.publishedMonthsSubject.next(JSON.parse(event.newValue));
      }
    });
  }

  private saveEmployees(employees: Employee[]) {
    localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees));
    this.employeesSubject.next(employees);
  }

  saveCompanySchedule(year: number, month: number, schedule: ScheduleDay[]) {
    const key = `${year}-${month}`;
    const current = this.companyScheduleSubject.getValue();
    const updated = { ...current, [key]: schedule };
    localStorage.setItem(this.COMPANY_SCHEDULE_KEY, JSON.stringify(updated));
    this.companyScheduleSubject.next(updated);
    this.mergeCompanyScheduleToAll(year, month, schedule);
  }

  private mergeCompanyScheduleToAll(year: number, month: number, companySchedule: ScheduleDay[]) {
    const monthKeySuffix = `_${year}-${month}`;
    const current = this.deptSchedulesSubject.getValue();
    let hasChanges = false;
    const updated = { ...current };

    for (const [key, data] of Object.entries(updated)) {
      if (!key.endsWith(monthKeySuffix)) continue;
      
      if (data.isUniform && data.schedule) {
        data.schedule = data.schedule.map((day, idx) => {
          if (companySchedule[idx] && companySchedule[idx].type === 'L' && day.date === companySchedule[idx].date) {
            return { ...day, type: 'L', holidayName: companySchedule[idx].holidayName };
          }
          return day;
        });
        hasChanges = true;
      } else if (!data.isUniform && data.employeeSchedules) {
        for (const email of Object.keys(data.employeeSchedules)) {
          data.employeeSchedules[email] = data.employeeSchedules[email].map((day, idx) => {
            if (companySchedule[idx] && companySchedule[idx].type === 'L' && day.date === companySchedule[idx].date) {
              return { ...day, type: 'L', holidayName: companySchedule[idx].holidayName };
            }
            return day;
          });
        }
        hasChanges = true;
      }
    }

    if (hasChanges) {
      localStorage.setItem(this.DEPT_SCHEDULES_KEY, JSON.stringify(updated));
      this.deptSchedulesSubject.next(updated);
    }
  }

  publishMonth(year: number, month: number) {
    const key = `${year}-${month + 1}`;
    const current = this.publishedMonthsSubject.getValue();
    if (!current.includes(key)) {
      const updated = [...current, key];
      localStorage.setItem('mock_db_published_months', JSON.stringify(updated));
      this.publishedMonthsSubject.next(updated);
    }
  }

  getPublishedMonthsSync(): string[] {
    return this.publishedMonthsSubject.getValue();
  }

  getCompanyScheduleSync(year: number, month: number): ScheduleDay[] {
    const key = `${year}-${month}`;
    const current = this.companyScheduleSubject.getValue();
    return current[key] || [];
  }

  saveDepartmentSchedule(department: string, year: number, month: number, data: DepartmentScheduleData) {
    const key = `${department}_${year}-${month}`;
    const current = this.deptSchedulesSubject.getValue();
    const updated = { ...current, [key]: data };
    localStorage.setItem(this.DEPT_SCHEDULES_KEY, JSON.stringify(updated));
    this.deptSchedulesSubject.next(updated);
  }

  updateDepartmentRequest(department: string, status: 'PENDING_HEAD' | 'PENDING_HR' | 'APPROVED', month?: number, year?: number) {
    const current = this.deptRequestsSubject.getValue();
    const existing = current[department];
    const m = month !== undefined ? month : (existing?.month || new Date().getMonth() + 1);
    const y = year !== undefined ? year : (existing?.year || new Date().getFullYear());
    // If resetting to PENDING_HEAD, we should also clear approvedEmployees, but let's keep it simple or just preserve them
    const approved = existing?.approvedEmployees || [];

    const updated = { ...current, [department]: { department, status, month: m, year: y, approvedEmployees: status === 'APPROVED' ? [] : approved } };
    localStorage.setItem(this.DEPT_REQUESTS_KEY, JSON.stringify(updated));
    this.deptRequestsSubject.next(updated);
  }

  approveEmployeeSchedule(department: string, email: string): number {
    const current = this.deptRequestsSubject.getValue();
    const existing = current[department];
    if (existing) {
      const approved = existing.approvedEmployees || [];
      if (!approved.includes(email)) {
        approved.push(email);
      }
      
      const allEmployees = this.getEmployeesSync().filter(e => e.department === department);
      
      if (approved.length >= allEmployees.length) {
        existing.status = 'APPROVED';
      }
      existing.approvedEmployees = approved;
      
      const updated = { ...current, [department]: existing };
      localStorage.setItem(this.DEPT_REQUESTS_KEY, JSON.stringify(updated));
      this.deptRequestsSubject.next(updated);
      
      return Math.max(0, allEmployees.length - approved.length);
    }
    return 0;
  }


  getDepartmentScheduleSync(department: string, year: number, month: number): DepartmentScheduleData | null {
    const key = `${department}_${year}-${month}`;
    const current = this.deptSchedulesSubject.getValue();
    return current[key] || null;
  }

  getDepartmentRequestSync(department: string): DepartmentRequest | null {
    const current = this.deptRequestsSubject.getValue();
    return current[department] || null;
  }

  getAllDepartmentRequestsSync(): DepartmentRequest[] {
    const current = this.deptRequestsSubject.getValue();
    return Object.values(current);
  }

  // --- Leave Request Methods ---
  
  getLeaveRequestsSync(): LeaveRequest[] {
    return this.leaveRequestsSubject.getValue();
  }
  
  getLeaveRequestsByEmployeeSync(email: string): LeaveRequest[] {
    return this.getLeaveRequestsSync().filter(r => r.employeeEmail === email);
  }
  
  // --- Symbol Methods ---
  
  getSymbolsSync(): ScheduleSymbol[] {
    return this.symbolsSubject.getValue();
  }
  
  saveSymbols(symbols: ScheduleSymbol[]) {
    localStorage.setItem(this.SYMBOLS_KEY, JSON.stringify(symbols));
    this.symbolsSubject.next(symbols);
  }
  
  getSymbolColor(code: string): string {
    const symbol = this.getSymbolsSync().find(s => s.code === code);
    return symbol ? symbol.color : '#e0e0e0';
  }
  
  addLeaveRequest(request: Omit<LeaveRequest, 'id'>) {
    const current = this.getLeaveRequestsSync();
    const nextId = current.length > 0 ? Math.max(...current.map(r => r.id)) + 1 : 1;
    const newRequest: LeaveRequest = { ...request, id: nextId };
    const updated = [...current, newRequest];
    localStorage.setItem(this.LEAVE_REQUESTS_KEY, JSON.stringify(updated));
    this.leaveRequestsSubject.next(updated);
  }
  
  updateLeaveRequestStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    const current = this.getLeaveRequestsSync();
    const index = current.findIndex(r => r.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], status };
      localStorage.setItem(this.LEAVE_REQUESTS_KEY, JSON.stringify([...current]));
      this.leaveRequestsSubject.next([...current]);
    }
  }

  // --- Mock API Methods ---

  getEmployees(): Observable<Employee[]> {
    return this.employees$;
  }

  getEmployeesSync(): Employee[] {
    return this.employeesSubject.getValue();
  }

  getEmployeesByDepartment(departmentName: string): Employee[] {
    return this.getEmployeesSync().filter(emp => emp.department.toLowerCase().includes(departmentName.toLowerCase()));
  }

  addEmployee(employee: Employee) {
    const current = this.getEmployeesSync();
    // Generate simple ID
    const nextId = current.length > 0 ? Math.max(...current.map(e => e.id)) + 1 : 1;
    employee.id = nextId;
    
    const updated = [...current, employee];
    this.saveEmployees(updated);
  }

  updateEmployee(updatedEmployee: Employee) {
    const current = this.getEmployeesSync();
    const index = current.findIndex(e => e.id === updatedEmployee.id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedEmployee };
      this.saveEmployees([...current]);
    }
  }

  deleteEmployee(id: number) {
    const current = this.getEmployeesSync();
    const updated = current.filter(e => e.id !== id);
    this.saveEmployees(updated);
  }
}

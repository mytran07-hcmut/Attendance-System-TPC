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

export interface DepartmentRequest {
  department: string;
  status: 'PENDING_HEAD' | 'PENDING_HR' | 'APPROVED';
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


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly EMPLOYEES_KEY = 'mock_db_employees_v2';
  private readonly COMPANY_SCHEDULE_KEY = 'mock_db_company_schedule';
  private readonly DEPT_SCHEDULES_KEY = 'mock_db_dept_schedules';
  private readonly DEPT_REQUESTS_KEY = 'mock_db_dept_requests';
  private readonly LEAVE_REQUESTS_KEY = 'mock_db_leave_requests';
  
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  private companyScheduleSubject = new BehaviorSubject<ScheduleDay[]>([]);
  public companySchedule$ = this.companyScheduleSubject.asObservable();

  private deptSchedulesSubject = new BehaviorSubject<{ [dept: string]: ScheduleDay[] }>({});
  public deptSchedules$ = this.deptSchedulesSubject.asObservable();

  private deptRequestsSubject = new BehaviorSubject<{ [dept: string]: DepartmentRequest }>({});
  public deptRequests$ = this.deptRequestsSubject.asObservable();

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
      this.companyScheduleSubject.next(JSON.parse(storedCompanySchedule));
    }

    const storedDeptSchedules = localStorage.getItem(this.DEPT_SCHEDULES_KEY);
    if (storedDeptSchedules) {
      this.deptSchedulesSubject.next(JSON.parse(storedDeptSchedules));
    }

    const storedDeptRequests = localStorage.getItem(this.DEPT_REQUESTS_KEY);
    if (storedDeptRequests) {
      this.deptRequestsSubject.next(JSON.parse(storedDeptRequests));
    }

    const storedLeaveRequests = localStorage.getItem(this.LEAVE_REQUESTS_KEY);
    if (storedLeaveRequests) {
      this.leaveRequestsSubject.next(JSON.parse(storedLeaveRequests));
    }

    // Sync across tabs
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
    });
  }

  private saveEmployees(employees: Employee[]) {
    localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees));
    this.employeesSubject.next(employees);
  }

  saveCompanySchedule(schedule: ScheduleDay[]) {
    localStorage.setItem(this.COMPANY_SCHEDULE_KEY, JSON.stringify(schedule));
    this.companyScheduleSubject.next(schedule);
  }

  saveDepartmentSchedule(department: string, schedule: ScheduleDay[]) {
    const current = this.deptSchedulesSubject.getValue();
    const updated = { ...current, [department]: schedule };
    localStorage.setItem(this.DEPT_SCHEDULES_KEY, JSON.stringify(updated));
    this.deptSchedulesSubject.next(updated);
  }

  updateDepartmentRequest(department: string, status: 'PENDING_HEAD' | 'PENDING_HR' | 'APPROVED') {
    const current = this.deptRequestsSubject.getValue();
    const updated = { ...current, [department]: { department, status } };
    localStorage.setItem(this.DEPT_REQUESTS_KEY, JSON.stringify(updated));
    this.deptRequestsSubject.next(updated);
  }

  getCompanyScheduleSync(): ScheduleDay[] {
    return this.companyScheduleSubject.getValue();
  }

  getDepartmentScheduleSync(department: string): ScheduleDay[] | null {
    const current = this.deptSchedulesSubject.getValue();
    return current[department] || null;
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

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
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly EMPLOYEES_KEY = 'mock_db_employees';
  
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    const storedEmployees = localStorage.getItem(this.EMPLOYEES_KEY);
    if (storedEmployees) {
      this.employeesSubject.next(JSON.parse(storedEmployees));
    } else {
      // Add default values for phone and status if not present
      const initialData: Employee[] = EMPLOYEES_MOCK.map(emp => ({
        ...emp,
        phone: '0901234567', // Mock phone
        status: 'Làm việc'
      }));
      this.saveEmployees(initialData);
    }
  }

  private saveEmployees(employees: Employee[]) {
    localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees));
    this.employeesSubject.next(employees);
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

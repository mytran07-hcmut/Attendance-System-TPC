import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatabaseService, Employee, Branch } from '../../../core/services/database.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    FileUploadModule,
    ToggleSwitchModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employees.html',
  styleUrl: './employees.scss'
})
export class Employees implements OnInit {
  departments = [
    { label: 'Tất cả phòng ban', value: null },
    { label: 'Phòng IT', value: 'Phòng IT' },
    { label: 'Phòng Nhân sự', value: 'Phòng Nhân sự' },
    { label: 'Phòng Kế toán', value: 'Phòng Kế toán' },
    { label: 'Phòng Marketing', value: 'Phòng Marketing' },
    { label: 'Phòng Sales', value: 'Phòng Sales' },
    { label: 'Ban Giám đốc', value: 'Ban Giám đốc' }
  ];
  selectedDepartment: string | null = null;

  allEmployees: Employee[] = [];
  employees: Employee[] = [];
  branches: Branch[] = [];

  displayDetailDialog: boolean = false;
  selectedEmployee: any = null;

  displayAddDialog: boolean = false;
  newEmployee: any = {};
  cccdDuplicateOf: string | null = null;

  hrPermissions = {
    manageSchedule: false,
    approveSchedule: false,
    manageLeave: false,
    viewReports: false
  };

  constructor(
    private db: DatabaseService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.db.employees$.subscribe(data => {
      this.allEmployees = data;
      this.filterEmployees();
    });
    this.db.branches$.subscribe(data => {
      this.branches = data;
    });
  }

  getBranchName(branchId: string | undefined): string {
    if (!branchId) return 'Chưa phân công';
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Không xác định';
  }

  onDepartmentChange() {
    this.filterEmployees();
  }

  filterEmployees() {
    if (this.selectedDepartment && this.selectedDepartment !== 'Tất cả') {
      this.employees = this.allEmployees.filter(e => e.department === this.selectedDepartment);
    } else {
      this.employees = [...this.allEmployees];
    }
  }

  isHR(emp: Employee | null): boolean {
    if (!emp) return false;
    return emp.department === 'Phòng Nhân sự' || (emp.title && emp.title.includes('HR'));
  }

  viewDetails(employee: Employee) {
    this.selectedEmployee = employee;
    if (this.isHR(employee)) {
      const perms = employee.permissions || [];
      this.hrPermissions = {
        manageSchedule: perms.includes('Tạo lịch'),
        approveSchedule: perms.includes('Duyệt lịch'),
        manageLeave: perms.includes('Quản lý nghỉ phép'),
        viewReports: perms.includes('Báo cáo')
      };
    }
    this.displayDetailDialog = true;
  }

  updateHrPermissions() {
    if (this.selectedEmployee && this.isHR(this.selectedEmployee)) {
      let updatedPerms = [];
      if (this.hrPermissions.manageSchedule) updatedPerms.push('Tạo lịch');
      if (this.hrPermissions.approveSchedule) updatedPerms.push('Duyệt lịch');
      if (this.hrPermissions.manageLeave) updatedPerms.push('Quản lý nghỉ phép');
      if (this.hrPermissions.viewReports) updatedPerms.push('Báo cáo');

      this.selectedEmployee.permissions = updatedPerms;
      this.db.updateEmployee(this.selectedEmployee);

      const index = this.allEmployees.findIndex(e => e.id === this.selectedEmployee.id);
      if (index !== -1) {
        this.allEmployees[index] = { ...this.selectedEmployee };
      }
      this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật phân quyền HR', life: 2000 });
    }
  }

  updateEmployeeBranch() {
    if (this.selectedEmployee) {
      this.db.updateEmployee(this.selectedEmployee);
      this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật chi nhánh làm việc', life: 2000 });

      const index = this.allEmployees.findIndex(e => e.id === this.selectedEmployee.id);
      if (index !== -1) {
        this.allEmployees[index] = { ...this.selectedEmployee };
      }
      this.filterEmployees();
    }
  }

  canDelete(employee: Employee): boolean {
    if (!employee) return false;
    if (employee.department === 'Ban Giám đốc') return false;
    if (employee.title && employee.title.includes('Admin')) return false;
    return true;
  }

  confirmDelete(employee: Employee) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xoá nhân viên này khỏi danh sách mãi mãi không?',
      header: 'Xác nhận xoá',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xoá',
      rejectLabel: 'Huỷ',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.db.deleteEmployee(employee.id);
        this.displayDetailDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xoá nhân viên', life: 3000 });
      }
    });
  }

  openAddDialog() {
    this.newEmployee = {
      fullName: '',
      phone: '',
      department: 'Phòng IT',
      branchId: 'B_Q1',
      cccd: '',
      avatar: ''
    };
    this.cccdDuplicateOf = null;
    this.displayAddDialog = true;
  }

  generateCode(): string {
    const maxId = this.allEmployees.length > 0 ? Math.max(...this.allEmployees.map(e => e.id)) : 0;
    const nextNum = maxId + 1;
    return 'NV' + nextNum.toString().padStart(3, '0');
  }

  onCccdChange() {
    const val = (this.newEmployee.cccd || '').trim();
    if (!val) {
      this.cccdDuplicateOf = null;
      return;
    }
    const duplicate = this.allEmployees.find(e => e.cccd && e.cccd.trim() === val);
    this.cccdDuplicateOf = duplicate ? duplicate.fullName : null;
  }

  removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  generateEmail(fullName: string): string {
    if (!fullName) return '';
    const parts = this.removeAccents(fullName.trim()).toLowerCase().split(' ');
    if (parts.length === 1) return `${parts[0]}@tpc.com`;
    const last = parts.pop();
    const first = parts[0];
    return `${last}.${first}@tpc.com`;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1000000) {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Kích thước ảnh vượt quá 1MB.', life: 3000 });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newEmployee.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveEmployee() {
    if (!this.newEmployee.fullName || !this.newEmployee.department || !this.newEmployee.cccd || !this.newEmployee.branchId) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ thông tin bắt buộc (Họ tên, Phòng ban, Chi nhánh, CCCD)', life: 3000 });
      return;
    }

    if (this.cccdDuplicateOf) {
      this.messageService.add({ severity: 'error', summary: 'Trùng CCCD', detail: `Số CCCD đã được đăng ký bởi ${this.cccdDuplicateOf}. Vui lòng kiểm tra lại.`, life: 4000 });
      return;
    }

    // Check for duplicates (same fullName, phone, department)
    const isDuplicate = this.allEmployees.some(e =>
      e.fullName === this.newEmployee.fullName &&
      e.phone === this.newEmployee.phone &&
      e.department === this.newEmployee.department
    );

    if (isDuplicate) {
      this.messageService.add({ severity: 'error', summary: 'Trùng lặp', detail: 'Nhân viên này đã tồn tại trong hệ thống.', life: 4000 });
      return;
    }

    const title = this.newEmployee.department === 'Phòng Nhân sự' ? 'HR' :
      (this.newEmployee.department === 'Ban Giám đốc' ? 'Admin (Ban Giám đốc)' :
        'Nhân viên (' + this.newEmployee.department.replace('Phòng ', '') + ')');

    const emp: Employee = {
      id: 0,
      code: this.generateCode(),
      fullName: this.newEmployee.fullName,
      department: this.newEmployee.department,
      title: title,
      email: this.generateEmail(this.newEmployee.fullName),
      phone: this.newEmployee.phone || '',
      status: 'Làm việc',
      avatar: this.newEmployee.avatar || '',
      branchId: this.newEmployee.branchId,
      cccd: this.newEmployee.cccd
    };

    this.db.addEmployee(emp);
    this.displayAddDialog = false;
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm nhân viên mới', life: 3000 });
  }
}

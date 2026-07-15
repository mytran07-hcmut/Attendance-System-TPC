import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss'
})
export class Employees implements OnInit {
  departmentId: string | null = null;
  departmentName: string = '';
  employees: any[] = [];
  
  displayDetailDialog: boolean = false;
  selectedEmployee: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.departmentId = params.get('id');
      this.loadDepartmentData();
    });
  }

  loadDepartmentData() {
    // In a real app, you would fetch this data from an API based on departmentId
    if (this.departmentId === '1') {
      this.departmentName = 'Phòng IT';
      this.employees = [
        { id: 101, code: 'NV001', name: 'Nguyễn Văn A', position: 'Software Engineer', email: 'nva@company.com', phone: '0901234567', status: 'Làm việc' },
        { id: 102, code: 'NV002', name: 'Trần Thị B', position: 'QA Engineer', email: 'ttb@company.com', phone: '0901234568', status: 'Làm việc' },
        { id: 103, code: 'NV003', name: 'Lê Văn C', position: 'DevOps', email: 'lvc@company.com', phone: '0901234569', status: 'Nghỉ thai sản' }
      ];
    } else {
      this.departmentName = 'Phòng ban ' + this.departmentId;
      this.employees = [
        { id: 201, code: 'NV004', name: 'Nhân viên Demo', position: 'Staff', email: 'demo@company.com', phone: '0900000000', status: 'Làm việc' }
      ];
    }
  }

  viewDetails(employee: any) {
    this.selectedEmployee = employee;
    this.displayDetailDialog = true;
  }
}


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
import { DatabaseService, Employee } from '../../../core/services/database.service';

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
  employees: Employee[] = [];
  
  displayDetailDialog: boolean = false;
  selectedEmployee: any = null;

  constructor(private route: ActivatedRoute, private db: DatabaseService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.departmentId = params.get('id');
      this.loadDepartmentData();
    });
  }

  loadDepartmentData() {
    this.db.employees$.subscribe(allEmployees => {
      if (this.departmentId === '1') {
        this.departmentName = 'Phòng Công nghệ & Hệ thống Dữ liệu (IT Sys)';
        this.employees = this.db.getEmployeesByDepartment('IT');
      } else {
        // Fallback or handle other departments
        this.departmentName = 'Phòng ban ' + this.departmentId;
        // For demo, just show some random employees or all
        this.employees = allEmployees.slice(0, 10);
      }
    });
  }

  viewDetails(employee: any) {
    this.selectedEmployee = employee;
    this.displayDetailDialog = true;
  }
}


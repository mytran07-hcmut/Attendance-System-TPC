import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './departments.html',
  styleUrl: './departments.scss'
})
export class Departments implements OnInit {
  departments: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.departments = [
      { id: 1, name: 'Phòng IT', count: 45, icon: 'pi pi-desktop', color: 'blue' },
      { id: 2, name: 'Phòng Nhân sự', count: 12, icon: 'pi pi-users', color: 'orange' },
      { id: 3, name: 'Phòng Kế toán', count: 8, icon: 'pi pi-wallet', color: 'green' },
      { id: 4, name: 'Phòng Marketing', count: 24, icon: 'pi pi-megaphone', color: 'purple' },
      { id: 5, name: 'Phòng Sales', count: 60, icon: 'pi pi-chart-line', color: 'cyan' },
      { id: 6, name: 'Ban Giám đốc', count: 5, icon: 'pi pi-star', color: 'yellow' }
    ];
  }

  viewEmployees(deptId: number) {
    this.router.navigate(['/admin/departments', deptId, 'employees']);
  }
}


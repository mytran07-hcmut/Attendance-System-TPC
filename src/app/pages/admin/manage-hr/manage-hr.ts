import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-manage-hr',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToggleSwitchModule,
    FormsModule,
    TagModule,
    ToastModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './manage-hr.html',
  styleUrl: './manage-hr.scss'
})
export class ManageHr implements OnInit {
  hrUsers: any[] = [];
  displayEditDialog: boolean = false;
  selectedHr: any = null;

  permissions = {
    manageSchedule: false,
    approveSchedule: false,
    manageLeave: false,
    viewReports: false
  };

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.hrUsers = [
      { id: 1, name: 'Trần Thị Thu', email: 'thutt@hr.com', status: 'Hoạt động', permissions: ['Tạo lịch', 'Duyệt lịch'] },
      { id: 2, name: 'Lê Hoàng Hải', email: 'hailh@hr.com', status: 'Hoạt động', permissions: ['Báo cáo'] },
      { id: 3, name: 'Phạm Quang Minh', email: 'minhpq@hr.com', status: 'Tạm khóa', permissions: [] }
    ];
  }

  editPermissions(hr: any) {
    this.selectedHr = hr;
    // Map existing permissions to the toggle switches
    this.permissions = {
      manageSchedule: hr.permissions.includes('Tạo lịch'),
      approveSchedule: hr.permissions.includes('Duyệt lịch'),
      manageLeave: hr.permissions.includes('Quản lý nghỉ phép'),
      viewReports: hr.permissions.includes('Báo cáo')
    };
    this.displayEditDialog = true;
  }

  savePermissions() {
    if (this.selectedHr) {
      // Update the permissions array based on toggles
      let updatedPerms = [];
      if (this.permissions.manageSchedule) updatedPerms.push('Tạo lịch');
      if (this.permissions.approveSchedule) updatedPerms.push('Duyệt lịch');
      if (this.permissions.manageLeave) updatedPerms.push('Quản lý nghỉ phép');
      if (this.permissions.viewReports) updatedPerms.push('Báo cáo');
      
      this.selectedHr.permissions = updatedPerms;
      
      this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật quyền cho ' + this.selectedHr.name });
    }
    this.displayEditDialog = false;
  }
}


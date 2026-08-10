import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { DatabaseService, ScheduleDay } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth';

import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, BadgeModule, DatePickerModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss'
})
export class Attendance implements OnInit {
  today: Date = new Date();
  currentViewMonth: Date = new Date();
  hasConfirmed: boolean = false;
  hasCheckedOut: boolean = false;
  attendanceStatus: 'present' | 'absent' | null = null;
  isLeaveSubmitted: boolean = false;
  showSuccessAnimation: boolean = false;
  isSchedulePublished: boolean = true;
  hasSchedule: boolean = true;
  firstCheckInTime: string | null = null;
  
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  employeeSchedule: any[] = [];

  constructor(private router: Router, private db: DatabaseService, private authService: AuthService) {}

  ngOnInit() {
    this.db.leaveRequests$.subscribe(() => {
      this.generateMockSchedule();
    });
  }

  generateMockSchedule() {
    this.employeeSchedule = [];
    let baseSchedule: ScheduleDay[] | null = null;
    
    const year = this.currentViewMonth.getFullYear();
    const month = this.currentViewMonth.getMonth();
    const key = `${year}-${month + 1}`;
    
    const publishedMonths = this.db.getPublishedMonthsSync();
    this.isSchedulePublished = publishedMonths.includes(key);
    
    if (!this.isSchedulePublished) {
        return; // Don't generate anything if not published
    }
    
    const user = this.authService.getCurrentUser();
    const userEmail = user ? user.email : '';
    const me = this.db.getEmployeesSync().find(e => e.email === userEmail);
    
    if (me) {
        const req = this.db.getDepartmentRequestSync(me.department);
        if (req && req.status === 'APPROVED') {
            const deptSchedule = this.db.getDepartmentScheduleSync(me.department, year, month + 1);
            if (deptSchedule) {
                if (deptSchedule.isUniform && deptSchedule.schedule) {
                    baseSchedule = deptSchedule.schedule;
                } else if (!deptSchedule.isUniform && deptSchedule.employeeSchedules && deptSchedule.employeeSchedules[userEmail]) {
                    baseSchedule = deptSchedule.employeeSchedules[userEmail];
                }
            }
        }
    }
    
    if (!baseSchedule || baseSchedule.length === 0) {
        baseSchedule = this.db.getCompanyScheduleSync(year, month + 1);
    }
    
        if (!baseSchedule || baseSchedule.length === 0) {
            this.hasSchedule = false;
            return;
        } else {
            this.hasSchedule = true;
        }

        baseSchedule.forEach(cell => {
            if (!cell.date) {
                this.employeeSchedule.push({ ...cell, isWeekend: false });
                return;
            }

            let isToday = cell.date === this.today.getDate() && 
                          this.currentViewMonth.getMonth() === this.today.getMonth() && 
                          this.currentViewMonth.getFullYear() === this.today.getFullYear();
            let isPast = (this.currentViewMonth.getFullYear() < this.today.getFullYear()) || 
                         (this.currentViewMonth.getFullYear() === this.today.getFullYear() && this.currentViewMonth.getMonth() < this.today.getMonth()) || 
                         (this.currentViewMonth.getFullYear() === this.today.getFullYear() && this.currentViewMonth.getMonth() === this.today.getMonth() && cell.date < this.today.getDate());
            
            let checkIn = null;
            let checkOut = null;
            let totalHours = null;

        this.employeeSchedule.push({
            ...cell,
            isToday: isToday,
            isPast: isPast,
            isPresent: false,
            isAbsent: false,
            leaveReason: null,
            checkIn: checkIn,
            checkOut: checkOut,
            totalHours: totalHours
        });
    });

    // Apply leave requests
    const leaveRequests = this.db.getLeaveRequestsByEmployeeSync(userEmail);
    const approvedLeaves = leaveRequests.filter(r => r.status === 'APPROVED');
    const rejectedLeaves = leaveRequests.filter(r => r.status === 'REJECTED');
    
    approvedLeaves.forEach(req => {
      if (req.dateRange && req.dateRange.length > 0) {
        let startDate = new Date(req.dateRange[0]);
        let endDate = req.dateRange.length > 1 ? new Date(req.dateRange[1]) : startDate;
        
        // Iterate through all days between startDate and endDate
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getFullYear() === this.currentViewMonth.getFullYear() && currentDate.getMonth() === this.currentViewMonth.getMonth()) {
            let dayNum = currentDate.getDate();
            this.employeeSchedule.forEach(cell => {
              if (cell.date === dayNum) {
                cell.type = req.typeCode;
                cell.isAbsent = true;
                cell.isApprovedLeave = true;
                cell.leaveReason = req.reason;
                cell.checkIn = null;
                cell.checkOut = null;
                cell.totalHours = null;
                
                // If it's today
                if (cell.isToday) {
                  this.hasConfirmed = true;
                  this.attendanceStatus = 'absent';
                  this.isLeaveSubmitted = true;
                }
              }
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    rejectedLeaves.forEach(req => {
      if (req.dateRange && req.dateRange.length > 0) {
        let startDate = new Date(req.dateRange[0]);
        let endDate = req.dateRange.length > 1 ? new Date(req.dateRange[1]) : startDate;
        
        // Iterate through all days between startDate and endDate
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getFullYear() === this.currentViewMonth.getFullYear() && currentDate.getMonth() === this.currentViewMonth.getMonth()) {
            let dayNum = currentDate.getDate();
            this.employeeSchedule.forEach(cell => {
              if (cell.date === dayNum) {
                cell.isRejectedLeave = true;
                cell.leaveReason = 'Từ chối: ' + req.reason;
              }
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
  }

  calculateTotalHours(checkIn: string, checkOut: string): string {
    if (!checkIn || !checkOut) return null;
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    
    let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMins < 0) return '00:00 hrs'; 
    
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} hrs`;
  }

  getSymbolColor(type: string): string {
    return this.db.getSymbolColor(type);
  }

  confirmAttendance() {
    this.showSuccessAnimation = true;
    this.hasConfirmed = true;
    this.attendanceStatus = 'present';
    const todayCell = this.employeeSchedule.find(c => c.isToday);
    if (todayCell) {
      todayCell.isPresent = true;
      if (!this.firstCheckInTime) {
        const now = new Date();
        this.firstCheckInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      }
      todayCell.checkIn = this.firstCheckInTime;
    }

    setTimeout(() => {
      this.showSuccessAnimation = false;
    }, 3200);
  }

  checkoutAttendance() {
    this.showSuccessAnimation = true;
    this.hasCheckedOut = true;
    const todayCell = this.employeeSchedule.find(c => c.isToday);
    if (todayCell && todayCell.checkIn) {
      const now = new Date();
      const outHour = now.getHours().toString().padStart(2, '0');
      const outMin = now.getMinutes().toString().padStart(2, '0');
      todayCell.checkOut = `${outHour}:${outMin}`;
      todayCell.totalHours = this.calculateTotalHours(todayCell.checkIn, todayCell.checkOut);
    }

    setTimeout(() => {
      this.showSuccessAnimation = false;
    }, 3200);
  }

  resetAttendance() {
    this.hasConfirmed = false;
    this.hasCheckedOut = false;
    this.attendanceStatus = null;
    this.isLeaveSubmitted = false;
    const todayCell = this.employeeSchedule.find(c => c.isToday);
    if (todayCell) {
      todayCell.isPresent = false;
      todayCell.isAbsent = false;
      todayCell.leaveReason = null;
      todayCell.checkIn = null;
      todayCell.checkOut = null;
      todayCell.totalHours = null;
    }
  }

  prevMonth() {
    this.currentViewMonth = new Date(this.currentViewMonth.getFullYear(), this.currentViewMonth.getMonth() - 1, 1);
    this.generateMockSchedule();
  }

  nextMonth() {
    this.currentViewMonth = new Date(this.currentViewMonth.getFullYear(), this.currentViewMonth.getMonth() + 1, 1);
    this.generateMockSchedule();
  }
}

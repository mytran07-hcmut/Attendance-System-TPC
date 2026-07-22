import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { DatabaseService, ScheduleDay } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, BadgeModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss'
})
export class Attendance implements OnInit {
  today: Date = new Date();
  hasConfirmed: boolean = false;
  attendanceStatus: 'present' | 'absent' | null = null;
  isLeaveSubmitted: boolean = false;
  showSuccessAnimation: boolean = false;
  
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  employeeSchedule: any[] = [];

  constructor(private router: Router, private db: DatabaseService, private authService: AuthService) {}

  ngOnInit() {
    this.generateMockSchedule();
    
    // Check if returning from leave request
    if (history.state && history.state.leaveSubmitted) {
      const dateRange = history.state.dateRange;
      
      let startDay = this.today.getDate();
      let endDay = this.today.getDate();
      
      if (dateRange && dateRange.length > 0) {
        let startDate = dateRange[0] ? new Date(dateRange[0]) : this.today;
        let endDate = dateRange[1] ? new Date(dateRange[1]) : startDate;
        
        startDay = startDate.getDate();
        endDay = endDate.getDate();
      }
      
      this.employeeSchedule.forEach(cell => {
        if (cell.date && cell.date >= startDay && cell.date <= endDay) {
          cell.isAbsent = true;
          cell.leaveReason = history.state.reason;
        }
      });
      
      // Only hide the check-in box for today if the leave request includes today
      const todayDate = this.today.getDate();
      if (todayDate >= startDay && todayDate <= endDay) {
        this.hasConfirmed = true;
        this.attendanceStatus = 'absent';
        this.isLeaveSubmitted = true;
      }
    }
  }

  generateMockSchedule() {
    this.employeeSchedule = [];
    let baseSchedule: ScheduleDay[] | null = null;
    
    const user = this.authService.getCurrentUser();
    const userEmail = user ? user.email : '';
    const me = this.db.getEmployeesSync().find(e => e.email === userEmail);
    
    if (me) {
        const req = this.db.getDepartmentRequestSync(me.department);
        if (req && req.status === 'APPROVED') {
            baseSchedule = this.db.getDepartmentScheduleSync(me.department);
        }
    }
    
    if (!baseSchedule || baseSchedule.length === 0) {
        baseSchedule = this.db.getCompanyScheduleSync();
    }
    
    // Fallback if no schedule in DB
    if (!baseSchedule || baseSchedule.length === 0) {
        baseSchedule = [];
        const daysInMonth = 31;
        let startDayOfWeek = 2; // Wed
        for (let i = 1; i < startDayOfWeek; i++) {
            baseSchedule.push({ date: null, type: '' });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            let currentDayOfWeek = (startDayOfWeek + i - 2) % 7;
            let isWeekend = currentDayOfWeek === 5 || currentDayOfWeek === 6;
            baseSchedule.push({ date: i, type: isWeekend ? 'OFF' : 'HC' });
        }
    }

    baseSchedule.forEach(cell => {
        if (!cell.date) {
            this.employeeSchedule.push({ ...cell, isWeekend: false });
            return;
        }

        let isToday = cell.date === this.today.getDate();
        let isPast = cell.date < this.today.getDate();
        
        let checkIn = null;
        let checkOut = null;
        let totalHours = null;
        if (isPast && cell.type === 'HC') {
            const inMin = Math.floor(Math.random() * 30).toString().padStart(2, '0');
            checkIn = `08:${inMin}`;
            const outHour = Math.floor(Math.random() * 2) + 17;
            const outMin = Math.floor(Math.random() * 60).toString().padStart(2, '0');
            checkOut = `${outHour}:${outMin}`;
            totalHours = this.calculateTotalHours(checkIn, checkOut);
        }

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
    switch (type) {
      case 'HC': return '#f4cccc';
      case 'OFF': return '#d9d2e9';
      case 'AL': return '#d9ead3';
      case 'KP': return '#c9daf8';
      case 'L': return '#fff2cc';
      default: return '#ffffff';
    }
  }

  confirmAttendance() {
    this.showSuccessAnimation = true;
    this.hasConfirmed = true;
    this.attendanceStatus = 'present';
    const todayCell = this.employeeSchedule.find(c => c.isToday);
    if (todayCell) {
      todayCell.isPresent = true;
      const now = new Date();
      todayCell.checkIn = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    setTimeout(() => {
      this.showSuccessAnimation = false;
    }, 3200);
  }


  resetAttendance() {
    this.hasConfirmed = false;
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
}

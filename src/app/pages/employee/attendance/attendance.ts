import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

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
    const daysInMonth = 31;
    let startDayOfWeek = 2; // Wed
    
    for (let i = 1; i < startDayOfWeek; i++) {
        this.employeeSchedule.push({ date: null, type: null, isWeekend: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        let currentDayOfWeek = (startDayOfWeek + i - 2) % 7;
        let isWeekend = currentDayOfWeek === 5 || currentDayOfWeek === 6;
        let type = 'HC';
        if (isWeekend) type = 'OFF';
        
        let isToday = i === this.today.getDate();
        
        let isPast = i < this.today.getDate();
        
        this.employeeSchedule.push({
            date: i,
            type: type,
            isWeekend: isWeekend,
            isToday: isToday,
            isPast: isPast,
            isPresent: false,
            isAbsent: false,
            leaveReason: null
        });
    }
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
    }

    setTimeout(() => {
      this.showSuccessAnimation = false;
    }, 3200);
  }

  declineAttendance() {
    this.hasConfirmed = true;
    this.attendanceStatus = 'absent';
    // Navigate to leave request
    this.router.navigate(['/employee/leave']);
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
    }
  }
}

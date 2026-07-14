import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss'
})
export class Attendance implements OnInit {
  today: Date = new Date();
  hasConfirmed: boolean = false;
  attendanceStatus: 'present' | 'absent' | null = null;
  
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  employeeSchedule: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.generateMockSchedule();
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
        
        this.employeeSchedule.push({
            date: i,
            type: type,
            isWeekend: isWeekend,
            isToday: isToday
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
    this.hasConfirmed = true;
    this.attendanceStatus = 'present';
  }

  declineAttendance() {
    this.hasConfirmed = true;
    this.attendanceStatus = 'absent';
    // Navigate to leave request
    this.router.navigate(['/employee/leave']);
  }
}

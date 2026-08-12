import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { DatabaseService, ScheduleDay, Branch } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth';

import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, BadgeModule, DatePickerModule, FormsModule, SelectModule, ToastModule, DialogModule],
  providers: [MessageService],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss'
})
export class Attendance implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  today: Date = new Date();
  currentViewMonth: Date = new Date();
  hasConfirmed: boolean = false;
  hasCheckedOut: boolean = false;
  attendanceStatus: 'present' | 'absent' | null = null;
  isLeaveSubmitted: boolean = false;
  showSuccessAnimation: boolean = false;
  showCheckInDialog: boolean = false;
  isSchedulePublished: boolean = true;
  hasSchedule: boolean = true;
  firstCheckInTime: string | null = null;
  
  shiftOptions = [
    { label: 'Cả Ngày', value: 'FULL_DAY' },
    { label: 'Ca Sáng', value: 'MORNING' },
    { label: 'Ca Chiều', value: 'AFTERNOON' }
  ];
  selectedShift: any = this.shiftOptions[0];

  cameraStream: MediaStream | null = null;
  capturedImage: string | null = null;
  location: { lat: number, lng: number, address: string } | null = null;
  locationError: string | null = null;
  isFetchingLocation: boolean = false;
  
  myBranch: Branch | null = null;
  distanceToBranch: number | null = null;
  
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  employeeSchedule: any[] = [];

  constructor(private router: Router, private db: DatabaseService, private authService: AuthService, private messageService: MessageService) {}

  ngOnInit() {
    this.db.leaveRequests$.subscribe(() => {
      this.generateMockSchedule();
    });
    
    const user = this.authService.getCurrentUser();
    if (user) {
        const emps = this.db.getEmployeesSync();
        const me = emps.find(e => e.email === user.email);
        if (me && me.branchId) {
            this.myBranch = this.db.getBranchesSync().find(b => b.id === me.branchId) || null;
        }
    }
  }

  ngAfterViewInit() {
  }

  openCheckInDialog() {
    this.showCheckInDialog = true;
    this.fetchLocation();
    setTimeout(() => {
        this.startCamera();
    }, 200);
  }

  closeCheckInDialog() {
    this.showCheckInDialog = false;
    this.stopCamera();
    this.capturedImage = null;
    this.locationError = null;
    this.isFetchingLocation = false;
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          this.cameraStream = stream;
          if (this.videoElement) {
            this.videoElement.nativeElement.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Camera error:', err);
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể truy cập camera.' });
        });
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }

  captureImage() {
    if (this.videoElement && this.canvasElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.capturedImage = canvas.toDataURL('image/png');
        this.stopCamera();
      }
    }
  }

  retakeImage() {
    this.capturedImage = null;
    this.startCamera();
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(dp/2) * Math.sin(dp/2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  fetchLocation() {
    this.isFetchingLocation = true;
    this.locationError = null;
    this.distanceToBranch = null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let addressString = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          
          // Cho phép chấm công ngay lập tức bằng tọa độ
          this.location = {
            lat: lat,
            lng: lng,
            address: addressString
          };
          
          if (this.myBranch) {
             this.distanceToBranch = this.calculateDistance(lat, lng, this.myBranch.lat, this.myBranch.lng);
             if (this.distanceToBranch > this.myBranch.radius) {
                 this.locationError = `Vị trí quá xa so với ${this.myBranch.name} (cách ${Math.round(this.distanceToBranch)}m). Vui lòng đến đúng chi nhánh để chấm công.`;
             }
          }
          
          this.isFetchingLocation = false;
          
          // Dịch địa chỉ ngầm ở background, không block UI
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
             .then(res => res.ok ? res.json() : null)
             .then(data => {
                if (data && data.display_name && this.location) {
                    this.location.address = data.display_name;
                }
             })
             .catch(e => console.error('Reverse geocoding error:', e));
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.locationError = 'Vui lòng cấp quyền truy cập vị trí để chấm công.';
          this.isFetchingLocation = false;
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      this.locationError = 'Trình duyệt không hỗ trợ Geolocation.';
      this.isFetchingLocation = false;
    }
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
    if (this.locationError || !this.location) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Bạn cần cấp quyền vị trí để chấm công' });
      return;
    }
    
    if (!this.capturedImage) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chụp ảnh selfie tại nơi làm việc' });
      return;
    }

    this.showSuccessAnimation = true;
    this.hasConfirmed = true;
    this.attendanceStatus = 'present';
    this.closeCheckInDialog();
    const todayCell = this.employeeSchedule.find(c => c.isToday);
    if (todayCell) {
      todayCell.isPresent = true;
      if (!this.firstCheckInTime) {
        const now = new Date();
        this.firstCheckInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      }
      todayCell.checkIn = this.firstCheckInTime;
    }

    const user = this.authService.getCurrentUser();
    if (user) {
       this.db.addAttendanceRecord({
          employeeEmail: user.email,
          date: new Date().toISOString().split('T')[0],
          shift: this.selectedShift.value,
          checkInTime: this.firstCheckInTime,
          checkOutTime: null,
          location: this.location,
          selfieUrl: this.capturedImage
       });
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
    
    const user = this.authService.getCurrentUser();
    if (user) {
        const todayDate = new Date().toISOString().split('T')[0];
        const records = this.db.getAttendanceRecordsByEmployeeSync(user.email);
        const todayRecord = records.find(r => r.date === todayDate);
        if (todayRecord && todayCell) {
            todayRecord.checkOutTime = todayCell.checkOut;
            this.db.updateAttendanceRecord(todayRecord);
        }
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

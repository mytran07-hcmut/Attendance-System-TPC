import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import Chart from 'chart.js/auto';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, SkeletonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  isLoading: boolean = true;
  totalEmployees: number = 0;
  newEmployees: number = 0;
  hrCount: number = 0;
  departmentCount: number = 0;

  barData: any;
  barOptions: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.initChart();
      } catch (e) {
        console.error('Error init chart', e);
      }
      
      // Simulate API call for skeleton loader
      setTimeout(() => {
        this.totalEmployees = 345;
        this.newEmployees = 12;
        this.hrCount = 5;
        this.departmentCount = 8;
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.barData = {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      datasets: [
        {
          label: 'Nhân viên mới',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
          borderColor: documentStyle.getPropertyValue('--p-primary-500'),
          data: [5, 2, 8, 4, 15, 6, 12]
        },
        {
          label: 'Nghỉ việc',
          backgroundColor: documentStyle.getPropertyValue('--p-red-500'),
          borderColor: documentStyle.getPropertyValue('--p-red-500'),
          data: [1, 0, 2, 1, 3, 1, 2]
        }
      ]
    };

    this.barOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  scrollToChart() {
    if (isPlatformBrowser(this.platformId)) {
      const el = document.getElementById('chartSection');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}

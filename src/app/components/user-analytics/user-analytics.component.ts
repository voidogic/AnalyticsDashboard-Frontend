import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { DataService, SalesData } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

@Component({
  selector: 'app-user-analytics',
  templateUrl: './user-analytics.component.html',
  styleUrls: ['./user-analytics.component.css']
})
export class UserAnalyticsComponent implements OnInit {
  @ViewChild('purchaseChart') purchaseChartCanvas: any;
  @ViewChild('categoryChart') categoryChartCanvas: any;
  @ViewChild('purchaseHistogramChart') purchaseHistogramCanvas: any;

  currentUserId: string = '';
  userName: string = '';
  selectedPeriod: TimePeriod = 'monthly';
  
  userSales: SalesData[] = [];
  purchaseSummary: any = null;
  categoryBreakdown: { [key: string]: number } = {};
  
  purchaseChart: Chart | null = null;
  categoryChart: Chart | null = null;
  purchaseHistogramChart: Chart | null = null;

  timePeriods: TimePeriod[] = ['weekly', 'monthly', 'yearly'];

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user._id;
      this.userName = user.fullName;
    }
  }

  ngOnInit(): void {
    if (!this.currentUserId) {
      this.initializeUser();
    }
    this.loadUserData();
    
    setTimeout(() => {
      this.createCharts();
    }, 500);
  }

  getUppercasePeriod(): string {
    return this.selectedPeriod.toUpperCase();
  }

  loadUserData(): void {
    if (!this.currentUserId) return;

    // Load user's sales data
    this.dataService.getUserSales(this.currentUserId).subscribe(sales => {
      this.userSales = sales.filter(s => s.status === 'completed');
      this.calculateCategoryBreakdown();
      this.createCharts();
    });

    // Load purchase summary
    const summary = this.dataService.getUserPurchaseSummary(this.currentUserId);
    this.purchaseSummary = summary;
  }

  calculateCategoryBreakdown(): void {
    this.categoryBreakdown = {};
    this.userSales.forEach(sale => {
      this.categoryBreakdown[sale.product] = (this.categoryBreakdown[sale.product] || 0) + sale.amount;
    });
  }

  onPeriodChange(): void {
    this.createCharts();
  }

  createCharts(): void {
    this.createPurchaseChart();
    this.createCategoryChart();
    this.createPurchaseHistogramChart();
  }

  createPurchaseChart(): void {
    const ctx = this.purchaseChartCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    let chartData: any[] = [];
    let labels: string[] = [];

    if (this.selectedPeriod === 'weekly') {
      const weeklyData = this.dataService.getUserWeeklyAnalytics(this.currentUserId);
      labels = weeklyData.map(d => this.formatWeek(d.week));
      chartData = weeklyData.map(d => d.amount);
    } else if (this.selectedPeriod === 'monthly') {
      const monthlyData = this.dataService.getUserMonthlyAnalytics(this.currentUserId);
      labels = monthlyData.map(d => this.formatMonth(d.month));
      chartData = monthlyData.map(d => d.amount);
    } else if (this.selectedPeriod === 'yearly') {
      const yearlyData = this.dataService.getUserYearlyAnalytics(this.currentUserId);
      labels = yearlyData.map(d => d.year);
      chartData = yearlyData.map(d => d.amount);
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Purchase Amount (${this.selectedPeriod})`,
            data: chartData,
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.12)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#0d9488',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#0f172a', font: { size: 12, weight: 500 } }
          }
        },
        scales: {
          y: {
            ticks: {
              color: '#475569',
              callback: (value: any) => `$${Number(value).toLocaleString()}` as any
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.purchaseChart) {
      this.purchaseChart.destroy();
    }
    this.purchaseChart = new Chart(ctx, config);
  }

  createCategoryChart(): void {
    const ctx = this.categoryChartCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const colors = [
      '#0d9488', '#1e293b', '#10b981', '#d97706', '#6366f1',
      '#dc2626', '#0ea5e9', '#84cc16', '#f97316', '#8b5cf6'
    ];

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: Object.keys(this.categoryBreakdown),
        datasets: [
          {
            data: Object.values(this.categoryBreakdown),
            backgroundColor: colors.slice(0, Object.keys(this.categoryBreakdown).length),
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#0f172a', font: { size: 12, weight: 500 }, padding: 15 }
          }
        }
      }
    };

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    this.categoryChart = new Chart(ctx, config);
  }

  private formatWeek(dateStr: string): string {
    const date = new Date(dateStr);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  createPurchaseHistogramChart(): void {
    const ctx = this.purchaseHistogramCanvas?.nativeElement?.getContext('2d');
    if (!ctx || this.userSales.length === 0) return;

    // Create bins for purchase amounts
    const bins = [0, 50, 100, 200, 500, 1000, 2000, 5000];
    const labels = bins.slice(0, -1).map((bin, index) => {
      const nextBin = bins[index + 1];
      return `$${bin}-${nextBin}`;
    });

    const counts = new Array(labels.length).fill(0);

    this.userSales.forEach(sale => {
      const amount = sale.amount;
      for (let i = 0; i < bins.length - 1; i++) {
        if (amount >= bins[i] && amount < bins[i + 1]) {
          counts[i]++;
          break;
        }
      }
      // Handle purchases above the last bin
      if (amount >= bins[bins.length - 1]) {
        counts[counts.length - 1]++;
      }
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Number of Purchases',
            data: counts,
            backgroundColor: 'rgba(13, 148, 136, 0.2)',
            borderColor: '#0d9488',
            borderWidth: 2,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#0f172a', font: { size: 12, weight: 500 } }
          }
        },
        scales: {
          y: {
            ticks: {
              color: '#475569',
              stepSize: 1
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.purchaseHistogramChart) {
      this.purchaseHistogramChart.destroy();
    }
    this.purchaseHistogramChart = new Chart(ctx, config);
  }

  private formatMonth(monthStr: string): string {
    const date = new Date(`${monthStr}-01`);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

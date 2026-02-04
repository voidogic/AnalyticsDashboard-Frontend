import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartEvent, ActiveElement, registerables } from 'chart.js';
import { DataService, YearlyOverview, EventAnalytics, UserAnalytics } from '../../services/data.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit, AfterViewInit {
  // Chart canvas references
  @ViewChild('yearlyTrendsCanvas') yearlyTrendsCanvas: any;
  @ViewChild('revenuePerEventCanvas') revenuePerEventCanvas: any;
  @ViewChild('participationRatioCanvas') participationRatioCanvas: any;
  @ViewChild('eventComparison') eventComparisonCanvas: any;
  @ViewChild('monthlyTrendsCanvas') monthlyTrendsCanvas: any;
  @ViewChild('revenueHistogramCanvas') revenueHistogramCanvas: any;
  @ViewChild('revenueShareCanvas') revenueShareCanvas: any;

  // Chart instances
  yearlyTrendsChart: Chart | null = null;
  revenuePerEventChart: Chart | null = null;
  participationRatioChart: Chart | null = null;
  eventComparisonChart: Chart | null = null;
  monthlyTrendsChart: Chart | null = null;
  revenueHistogramChart: Chart | null = null;
  revenueShareChart: Chart | null = null;

  // Data properties
  yearlyOverview: any = null;
  eventAnalytics: any[] = [];
  monthlyTrends: any[] = [];
  yearlyTrends: any[] = [];
  events: any[] = [];
  selectedEventId: string = '';
  usersAnalytics: UserAnalytics[] = [];
  metrics: any = null;
  selectedYear: number = new Date().getFullYear();
  isLoading: boolean = true;
  errorMessage: string = '';
  private revenuePerEventData: { labels: string[]; data: number[] } | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.yearlyTrends = this.generateYearlyData();

    // Load yearly overview
    this.dataService.getYearlyOverview(this.selectedYear).subscribe({
      next: (response: any) => {
        this.yearlyOverview = response.data;
        setTimeout(() => this.createCharts(), 0);
      },
      error: (error: any) => {
        console.error('Error loading yearly overview:', error);
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });

    // Load event analytics
    this.dataService.getEventAnalytics().subscribe({
      next: (response: any) => {
        this.eventAnalytics = response.data;
        setTimeout(() => {
          if (this.eventComparisonChart === null) {
            this.createEventComparisonChart();
          }
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading event analytics:', error);
      }
    });

    // Load monthly trends
    this.dataService.getMonthlyTrends(this.selectedYear).subscribe({
      next: (response: any) => {
        this.monthlyTrends = response.data;
        setTimeout(() => {
          if (this.monthlyTrendsChart === null) {
            this.createMonthlyTrendsChart();
          }
        }, 500);
      },
      error: (error: any) => {
        console.error('Error loading monthly trends:', error);
      }
    });

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  onYearChange(): void {
    this.destroyAllCharts();
    this.loadDashboardData();
  }

  destroyAllCharts(): void {
    if (this.yearlyTrendsChart) this.yearlyTrendsChart.destroy();
    if (this.revenuePerEventChart) this.revenuePerEventChart.destroy();
    if (this.participationRatioChart) this.participationRatioChart.destroy();
    if (this.eventComparisonChart) this.eventComparisonChart.destroy();
    if (this.monthlyTrendsChart) this.monthlyTrendsChart.destroy();
    if (this.revenueHistogramChart) this.revenueHistogramChart.destroy();
    if (this.revenueShareChart) this.revenueShareChart.destroy();
    this.revenuePerEventData = null;
  }

  getUserStats(): { activeAdmins: number; activeUsers: number; inactiveCount: number } | null {
    if (!this.metrics) return null;
    const activeAdmins = this.metrics.totalAdmins;
    const activeUsers = this.metrics.activeUsers;
    const inactiveCount = this.metrics.totalUsers - this.metrics.activeUsers;
    return { activeAdmins, activeUsers, inactiveCount };
  }

  loadYearlyOverview(): void {
    this.dataService.getYearlyOverview().subscribe({
      next: (response: YearlyOverview) => {
        this.yearlyOverview = response;
      },
      error: (error: any) => {
        console.error('Error loading yearly overview:', error);
      }
    });
  }



  loadEvents(): void {
    this.dataService.getAllEvents().subscribe({
      next: (response: any[]) => {
        this.events = response;
        if (this.events.length > 0) {
          this.selectedEventId = this.events[0]._id;
          this.loadEventAnalytics(this.selectedEventId);
        }
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
      }
    });
  }

  loadEventAnalytics(eventId: string): void {
    this.dataService.getEventAnalytics(eventId).subscribe({
      next: (response: EventAnalytics) => {
        this.createParticipationRatioChart();
        this.createEventWiseAnalyticsChart();
      },
      error: (error: any) => {
        console.error('Error loading event analytics:', error);
      }
    });
  }

  onEventChange(eventId: string): void {
    this.selectedEventId = eventId;
    this.loadEventAnalytics(eventId);
  }

  createEventWiseAnalyticsChart(): void {
    // This method creates event-wise analytics chart
    // Implementation can be added based on requirements
    console.log('Creating event-wise analytics chart');
  }

  createCharts(): void {
    this.createYearlyTrendsChart();
    this.createRevenuePerEventChart();
    this.createParticipationRatioChart();
    this.createEventComparisonChart();
  }

  createYearlyTrendsChart(): void {
    const ctx = this.yearlyTrendsCanvas?.nativeElement?.getContext('2d');
    if (!ctx || this.yearlyTrends.length === 0) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.yearlyTrends.map((d: any) => d.year.toString()),
        datasets: [
          {
            label: 'Total Events',
            data: this.yearlyTrends.map((d: any) => d.totalEvents),
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.12)',
            tension: 0.4
          },
          {
            label: 'Registered Students',
            data: this.yearlyTrends.map((d: any) => d.totalRegistrations),
            borderColor: '#1e293b',
            backgroundColor: 'rgba(30, 41, 59, 0.08)',
            tension: 0.4
          },
          {
            label: 'Appeared Students',
            data: this.yearlyTrends.map((d: any) => d.totalAppeared),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            tension: 0.4
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
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.yearlyTrendsChart) {
      this.yearlyTrendsChart.destroy();
    }
    this.yearlyTrendsChart = new Chart(ctx, config);
  }

  createRevenuePerEventChart(): void {
    const ctx = this.revenuePerEventCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.dataService.getRevenuePerEvent().subscribe({
      next: (response: any) => {
        this.revenuePerEventData = {
          labels: response.labels ?? [],
          data: response.datasets?.[0]?.data ?? []
        };

        const config: ChartConfiguration = {
          type: 'bar',
          data: {
            labels: response.labels,
            datasets: [{
              label: 'Revenue per Event',
              data: response.datasets[0].data,
              backgroundColor: 'rgba(13, 148, 136, 0.2)',
              borderColor: '#0d9488',
              borderWidth: 1,
              borderRadius: 6
            }]
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
                ticks: { color: '#475569' },
                grid: { color: 'rgba(0,0,0,0.05)' }
              },
              x: {
                ticks: { color: '#475569' },
                grid: { color: 'rgba(0,0,0,0.05)' }
              }
            }
          }
        };

        if (this.revenuePerEventChart) {
          this.revenuePerEventChart.destroy();
        }
        this.revenuePerEventChart = new Chart(ctx, config);

        // Create additional charts derived from the same revenue dataset
        setTimeout(() => {
          this.createRevenueHistogramChart();
          this.createRevenueShareDoughnutChart();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading revenue data:', error);
      }
    });
  }

  private createRevenueHistogramChart(): void {
    const ctx = this.revenueHistogramCanvas?.nativeElement?.getContext('2d');
    if (!ctx || !this.revenuePerEventData || this.revenuePerEventData.data.length === 0) return;

    const values = this.revenuePerEventData.data.map(v => Number(v)).filter(v => Number.isFinite(v) && v >= 0);
    if (values.length === 0) return;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(8, Math.max(4, values.length));
    const width = Math.max(1, Math.ceil((max - min) / binCount));

    const edges: number[] = [];
    for (let i = 0; i <= binCount; i++) edges.push(min + i * width);
    edges[edges.length - 1] = Math.max(edges[edges.length - 1], max + 1);

    const labels = edges.slice(0, -1).map((e, i) => `₹${Math.round(e / 1000)}k-₹${Math.round(edges[i + 1] / 1000)}k`);
    const counts = new Array(labels.length).fill(0);

    values.forEach(v => {
      for (let i = 0; i < edges.length - 1; i++) {
        if (v >= edges[i] && v < edges[i + 1]) {
          counts[i]++;
          return;
        }
      }
      counts[counts.length - 1]++;
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Events (count)',
            data: counts,
            backgroundColor: 'rgba(30, 41, 59, 0.15)',
            borderColor: '#1e293b',
            borderWidth: 1,
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
            ticks: { color: '#475569', stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.revenueHistogramChart) this.revenueHistogramChart.destroy();
    this.revenueHistogramChart = new Chart(ctx, config);
  }

  private createRevenueShareDoughnutChart(): void {
    const ctx = this.revenueShareCanvas?.nativeElement?.getContext('2d');
    if (!ctx || !this.revenuePerEventData || this.revenuePerEventData.data.length === 0) return;

    const labels = this.revenuePerEventData.labels;
    const data = this.revenuePerEventData.data.map(v => Number(v));

    const colors = [
      'rgba(13, 148, 136, 0.85)',
      'rgba(30, 41, 59, 0.75)',
      'rgba(16, 185, 129, 0.75)',
      'rgba(217, 119, 6, 0.75)',
      'rgba(99, 102, 241, 0.75)',
      'rgba(220, 38, 38, 0.75)'
    ];

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue share',
            data,
            backgroundColor: labels.map((_, i) => colors[i % colors.length]),
            borderColor: '#ffffff',
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
            labels: { color: '#0f172a', font: { size: 11, weight: 500 }, padding: 12 }
          }
        }
      }
    };

    if (this.revenueShareChart) this.revenueShareChart.destroy();
    this.revenueShareChart = new Chart(ctx, config);
  }

  createParticipationRatioChart(): void {
    const ctx = this.participationRatioCanvas?.nativeElement?.getContext('2d');
    if (!ctx || !this.selectedEventId) return;

    this.dataService.getParticipationRatio(this.selectedEventId).subscribe({
      next: (response: any) => {
        const config: ChartConfiguration = {
          type: 'pie',
          data: {
            labels: response.labels,
            datasets: [{
              data: response.datasets[0].data,
              backgroundColor: ['rgba(13, 148, 136, 0.85)', 'rgba(30, 41, 59, 0.35)'],
              borderColor: ['#0d9488', '#1e293b'],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: true,
                labels: { color: '#0f172a', font: { size: 12, weight: 500 } }
              }
            }
          }
        };

        if (this.participationRatioChart) {
          this.participationRatioChart.destroy();
        }
        this.participationRatioChart = new Chart(ctx, config);
      },
      error: (error: any) => {
        console.error('Error loading participation ratio:', error);
      }
    });
  }

  createMonthlyTrendsChart(): void {
    const ctx = this.monthlyTrendsCanvas?.nativeElement?.getContext('2d');
    if (!ctx || this.monthlyTrends.length === 0) return;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = this.monthlyTrends.map((d: any) => monthNames[d.month - 1]);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Monthly Registrations',
            data: this.monthlyTrends.map((d: any) => d.totalRegistrations),
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.12)',
            tension: 0.4,
            fill: true,
            borderWidth: 2
          },
          {
            label: 'Monthly Revenue',
            data: this.monthlyTrends.map((d: any) => d.totalRevenue),
            borderColor: '#1e293b',
            backgroundColor: 'rgba(30, 41, 59, 0.08)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index' as any,
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            labels: { color: '#0f172a', font: { size: 12, weight: 500 } }
          }
        },
        scales: {
          y: {
            type: 'linear' as any,
            display: true,
            position: 'left',
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y1: {
            type: 'linear' as any,
            display: true,
            position: 'right',
            ticks: { color: '#475569' },
            grid: { drawOnChartArea: false }
          },
          x: {
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.monthlyTrendsChart) {
      this.monthlyTrendsChart.destroy();
    }
    this.monthlyTrendsChart = new Chart(ctx, config);
  }

  createEventComparisonChart(): void {
    const ctx = this.eventComparisonCanvas?.nativeElement?.getContext('2d');
    if (!ctx || this.eventAnalytics.length === 0) return;

    const colors = ['rgba(13, 148, 136, 0.7)', 'rgba(30, 41, 59, 0.6)'];

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.eventAnalytics.slice(0, 6).map((e: any) => e.name),
        datasets: [
          {
            label: 'Registrations',
            data: this.eventAnalytics.slice(0, 6).map((e: any) => e.totalRegistrations),
            backgroundColor: colors[0],
            borderColor: '#0d9488',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Attended',
            data: this.eventAnalytics.slice(0, 6).map((e: any) => e.totalAttended),
            backgroundColor: colors[1],
            borderColor: '#1e293b',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
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
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#475569' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.eventComparisonChart) {
      this.eventComparisonChart.destroy();
    }
    this.eventComparisonChart = new Chart(ctx, config);
  }



  // Helper functions to generate sample data
  generateYearlyData(): any[] {
    return [
      { year: 2021, totalEvents: 8, totalRegistrations: 245, totalAppeared: 189 },
      { year: 2022, totalEvents: 12, totalRegistrations: 398, totalAppeared: 312 },
      { year: 2023, totalEvents: 15, totalRegistrations: 562, totalAppeared: 451 },
      { year: 2024, totalEvents: 18, totalRegistrations: 735, totalAppeared: 618 },
      { year: 2025, totalEvents: 22, totalRegistrations: 912, totalAppeared: 789 }
    ];
  }

  generateRevenueData(): any[] {
    return [
      { eventName: 'Annual Fest', revenue: 45000 },
      { eventName: 'Tech Summit', revenue: 38000 },
      { eventName: 'Sports Day', revenue: 32000 },
      { eventName: 'Cultural Night', revenue: 28000 },
      { eventName: 'Workshop Series', revenue: 22000 }
    ];
  }

  generateAttendanceData(): any {
    return {
      attended: 650,
      notAttended: 150
    };
  }
}

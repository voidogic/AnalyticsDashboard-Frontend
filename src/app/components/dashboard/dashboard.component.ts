import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { DataService, AnalyticsMetrics, SalesData, UserData } from '../../services/data.service';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('revenueChart') revenueChartCanvas: any;
  @ViewChild('signupsChart') signupsChartCanvas: any;
  @ViewChild('productChart') productChartCanvas: any;
  @ViewChild('statusChart') statusChartCanvas: any;

  stats: StatCard[] = [];
  recentOrders: SalesData[] = [];
  metrics: AnalyticsMetrics | null = null;

  revenueChart: Chart | null = null;
  signupsChart: Chart | null = null;
  productChart: Chart | null = null;
  statusChart: Chart | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadRecentOrders();
    
    // Wait for view to render before creating charts
    setTimeout(() => {
      this.createCharts();
    }, 500);
  }

  loadMetrics(): void {
    this.dataService.getMetrics().subscribe(metrics => {
      this.metrics = metrics;
      if (metrics) {
        this.updateStats(metrics);
      }
    });
  }

  loadRecentOrders(): void {
    this.dataService.getSales().subscribe(sales => {
      // Get last 10 completed orders
      this.recentOrders = sales
        .filter(s => s.status === 'completed')
        .slice(0, 10);
    });
  }

  updateStats(metrics: AnalyticsMetrics): void {
    this.stats = [
      {
        title: 'Total Revenue',
        value: `$${metrics.totalRevenue.toLocaleString()}`,
        icon: '💰',
        color: '#667eea',
        trend: `Avg Order: $${metrics.avgOrderValue.toFixed(2)}`
      },
      {
        title: 'Total Orders',
        value: metrics.totalOrders,
        icon: '📦',
        color: '#764ba2',
        trend: `${metrics.conversionRate.toFixed(2)}% conversion`
      },
      {
        title: 'Active Users',
        value: metrics.activeUsers,
        icon: '👥',
        color: '#f093fb',
        trend: `of ${metrics.totalUsers} total users`
      },
      {
        title: 'New Signups',
        value: metrics.totalSignups,
        icon: '📈',
        color: '#4facfe',
        trend: `${metrics.totalAdmins} admins`
      }
    ];
  }

  createCharts(): void {
    this.createRevenueChart();
    this.createSignupsChart();
    this.createProductChart();
    this.createStatusChart();
  }

  createRevenueChart(): void {
    const monthlySales = this.dataService.getMonthlySalesData();
    
    const ctx = this.revenueChartCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: monthlySales.map(d => d.month),
        datasets: [
          {
            label: 'Monthly Revenue',
            data: monthlySales.map(d => d.amount),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#333', font: { size: 12, weight: 500 } }
          }
        },
        scales: {
          y: {
            ticks: { color: '#666', callback: (value: any) => `$${value.toLocaleString()}` },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#666' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    this.revenueChart = new Chart(ctx, config);
  }

  createSignupsChart(): void {
    const signupsData = this.dataService.getSignupsByDate();
    
    const ctx = this.signupsChartCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: signupsData.map(d => d.date),
        datasets: [
          {
            label: 'New Signups',
            data: signupsData.map(d => d.count),
            backgroundColor: '#764ba2',
            borderColor: '#764ba2',
            borderWidth: 0,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: undefined,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#333', font: { size: 12, weight: 500 } }
          }
        },
        scales: {
          y: {
            ticks: { color: '#666' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#666' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    };

    if (this.signupsChart) {
      this.signupsChart.destroy();
    }
    this.signupsChart = new Chart(ctx, config);
  }

  createProductChart(): void {
    const productData = this.dataService.getProductSalesBreakdown();
    
    const ctx = this.productChartCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30b0fe'];

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: productData.map(p => p.product),
        datasets: [
          {
            data: productData.map(p => p.amount),
            backgroundColor: colors.slice(0, productData.length),
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
            labels: { color: '#333', font: { size: 11, weight: 500 }, padding: 15 }
          }
        }
      }
    };

    if (this.productChart) {
      this.productChart.destroy();
    }
    this.productChart = new Chart(ctx, config);
  }

  createStatusChart(): void {
    const sales = this.dataService.getSales();
    let statusData: any;

    sales.subscribe(allSales => {
      const statusBreakdown = {
        completed: allSales.filter(s => s.status === 'completed').length,
        pending: allSales.filter(s => s.status === 'pending').length,
        processing: allSales.filter(s => s.status === 'processing').length,
        failed: allSales.filter(s => s.status === 'failed').length
      };

      const ctx = this.statusChartCanvas?.nativeElement?.getContext('2d');
      if (!ctx) return;

      const config: ChartConfiguration = {
        type: 'radar',
        data: {
          labels: ['Completed', 'Pending', 'Processing', 'Failed'],
          datasets: [
            {
              label: 'Order Status',
              data: [statusBreakdown.completed, statusBreakdown.pending, statusBreakdown.processing, statusBreakdown.failed],
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: '#667eea',
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: { color: '#333', font: { size: 12, weight: 500 } }
            }
          },
          scales: {
            r: {
              ticks: { color: '#666' },
              grid: { color: 'rgba(0,0,0,0.05)' }
            }
          }
        }
      };

      if (this.statusChart) {
        this.statusChart.destroy();
      }
      this.statusChart = new Chart(ctx, config);
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      default:
        return 'status-failed';
    }
  }
}

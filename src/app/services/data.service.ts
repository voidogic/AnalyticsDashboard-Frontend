import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';


export interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  signupSource?: string;
}

export interface Event {
  _id: string;
  name: string;
  description: string;
  year: number;
  startDate: string;
  endDate: string;
  venue: string;
  totalBudget: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  subEvents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubEvent {
  _id: string;
  name: string;
  description: string;
  event: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  registrationFee: number;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  student: {
    _id: string;
    fullName: string;
    email: string;
  };
  event: {
    _id: string;
    name: string;
    year: number;
  };
  subEvent: {
    _id: string;
    name: string;
    registrationFee: number;
  };
  registrationDate: string;
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amountPaid: number;
  attendedAt?: string;
  certificateIssued: boolean;
}

export interface SalesData {
  id: string;
  date: string;
  amount: number;
  orderId: string;
  customerName: string;
  userId: string;
  product: string;
  quantity: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
}

export interface UserAnalytics {
  userId: string;
  userName: string;
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  lastPurchaseDate: string;
  favoriteProduct: string;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  totalRegisteredStudents: number;
  totalAppearedStudents: number;
  totalRevenue: number;
  totalActiveStudents: number;
  upcomingEvents: number;
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  totalSignups: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface YearlyOverview {
  year: number;
  totalEvents: number;
  totalRegisteredStudents: number;
  totalAppearedStudents: number;
  totalRevenue: number;
}

export interface EventAnalytics {
  event: {
    id: string;
    name: string;
    year: number;
    status: string;
  };
  overall: {
    totalSubEvents: number;
    totalRegistrations: number;
    totalAttended: number;
    totalRevenue: number;
    revenuePerEvent: number;
  };
  subEvents: Array<{
    subEventId: string;
    subEventName: string;
    totalRegistrations: number;
    confirmedRegistrations: number;
    attendedParticipants: number;
    revenue: number;
    maxParticipants: number;
    registrationFee: number;
  }>;
}

export interface StudentAnalytics {
  totalParticipated: number;
  totalRegistrations: number;
  totalAmountPaid: number;
  recentRegistrations: Registration[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private usersSubject = new BehaviorSubject<UserData[]>([]);
  public users$ = this.usersSubject.asObservable();

  private salesSubject = new BehaviorSubject<SalesData[]>([]);
  public sales$ = this.salesSubject.asObservable();

  private metricsSubject = new BehaviorSubject<AnalyticsMetrics | null>(null);
  public metrics$ = this.metricsSubject.asObservable();

  constructor() {
    this.initializeDummyData();
  }

  private initializeDummyData(): void {
    this.generateUsers();
    this.generateSales();
    this.calculateMetrics();
  }

  private generateUsers(): void {
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];

    const users: UserData[] = [];
    
    // Generate 50 dummy users
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const isAdmin = i < 5; // First 5 users are admins
      const daysAgo = Math.floor(Math.random() * 90);

      users.push({
        _id: `user_${i + 1}`,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domain}`,
        role: isAdmin ? 'admin' : 'user',
        isActive: Math.random() > 0.2, // 80% active
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signupSource: ['Google', 'Facebook', 'Direct', 'Email'][Math.floor(Math.random() * 4)]
      });
    }

    this.usersSubject.next(users);
  }

  private generateSales(): void {
    // Deterministic, realistic-looking purchase data so charts always have meaningful values.
    // (This replaces the purely-random generator which could produce sparse/noisy analytics.)
    const products = ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Monitor', 'Keyboard', 'Mouse', 'Webcam'];
    const sales: SalesData[] = [];
    const users = this.usersSubject.value;

    const basePrice: Record<string, number> = {
      Laptop: 1200,
      Smartphone: 800,
      Tablet: 500,
      Headphones: 150,
      Monitor: 400,
      Keyboard: 100,
      Mouse: 50,
      Webcam: 80
    };

    const today = new Date();
    const monthsBack = 8; // last ~8 months of purchases
    let seq = 0;

    const pick = (arr: string[], seed: number) => arr[seed % arr.length];
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

    // For each user, generate 1–4 completed purchases per month + a few non-completed.
    users.forEach((u, uIdx) => {
      for (let m = monthsBack; m >= 0; m--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const purchasesThisMonth = 1 + ((uIdx + m) % 4);

        for (let p = 0; p < purchasesThisMonth; p++) {
          const day = 2 + ((uIdx * 3 + p * 5 + m * 2) % 24); // 2..25
          const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);

          const product = pick(products, uIdx + p + m * 2);
          const qRaw = 1 + ((uIdx + p + m) % 3);
          const quantity = clamp(qRaw, 1, 4);
          const price = basePrice[product] ?? 200;

          // Slight month-to-month variation by user & month.
          const variation = 0.9 + (((uIdx + m) % 7) / 20); // 0.9..1.2
          const amount = Math.round(price * quantity * variation);

          sales.push({
            id: `sale_${++seq}`,
            date: date.toISOString().split('T')[0],
            amount,
            orderId: `ORD-${String(seq + 1000).padStart(5, '0')}`,
            customerName: u.fullName,
            userId: u._id,
            product,
            quantity,
            status: 'completed'
          });
        }
      }

      // Add a couple of non-completed transactions for realism
      for (let k = 0; k < 2; k++) {
        const daysAgo = 3 + ((uIdx + k) % 21);
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const product = pick(products, uIdx + k + 5);
        const quantity = 1 + ((uIdx + k) % 2);
        const amount = Math.round((basePrice[product] ?? 200) * quantity);
        const status: SalesData['status'] = k % 2 === 0 ? 'processing' : 'pending';

        sales.push({
          id: `sale_${++seq}`,
          date: date.toISOString().split('T')[0],
          amount,
          orderId: `ORD-${String(seq + 1000).padStart(5, '0')}`,
          customerName: u.fullName,
          userId: u._id,
          product,
          quantity,
          status
        });
      }
    });

    // Sort by date descending
    sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.salesSubject.next(sales);
  }

  private calculateMetrics(): void {
    const users = this.usersSubject.value;
    const sales = this.salesSubject.value;

    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalSignups = totalUsers;

    const completedSales = sales.filter(s => s.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, s) => sum + s.amount, 0);
    const totalOrders = completedSales.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalOrders > totalSignups ? 0 : ((totalOrders / totalSignups) * 100);

    const metrics: AnalyticsMetrics = {
      totalEvents: 0, // Default value for event-related metrics
      totalRegisteredStudents: 0,
      totalAppearedStudents: 0,
      totalActiveStudents: activeUsers,
      upcomingEvents: 0,
      totalUsers,
      totalAdmins,
      activeUsers,
      totalSignups,
      totalRevenue,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    };

    this.metricsSubject.next(metrics);
  }

  // Get all users
  getUsers(): Observable<UserData[]> {
    return this.users$;
  }

  // Get all sales
  getSales(): Observable<SalesData[]> {
    return this.sales$;
  }

  // Get analytics metrics
  getMetrics(): Observable<AnalyticsMetrics | null> {
    return this.metrics$;
  }

  // Get sales by date range
  getSalesByDateRange(startDate: string, endDate: string): Observable<SalesData[]> {
    const sales = this.salesSubject.value.filter(s => s.date >= startDate && s.date <= endDate);
    return new BehaviorSubject(sales).asObservable();
  }

  // Get sales by status
  getSalesByStatus(status: string): Observable<SalesData[]> {
    const sales = this.salesSubject.value.filter(s => s.status === status);
    return new BehaviorSubject(sales).asObservable();
  }

  // Get daily sales data
  getDailySalesData(): { date: string; amount: number }[] {
    const dailySales: { [key: string]: number } = {};
    
    this.salesSubject.value.forEach(sale => {
      if (!dailySales[sale.date]) {
        dailySales[sale.date] = 0;
      }
      if (sale.status === 'completed') {
        dailySales[sale.date] += sale.amount;
      }
    });

    return Object.keys(dailySales)
      .sort()
      .map(date => ({ date, amount: dailySales[date] }));
  }

  // Get monthly sales data
  getMonthlySalesData(): { month: string; amount: number }[] {
    const monthlySales: { [key: string]: number } = {};
    
    this.salesSubject.value.forEach(sale => {
      const month = sale.date.substring(0, 7); // YYYY-MM
      if (!monthlySales[month]) {
        monthlySales[month] = 0;
      }
      if (sale.status === 'completed') {
        monthlySales[month] += sale.amount;
      }
    });

    return Object.keys(monthlySales)
      .sort()
      .slice(-12) // Last 12 months
      .map(month => ({ month, amount: monthlySales[month] }));
  }

  // Get signup data by date
  getSignupsByDate(): { date: string; count: number }[] {
    const signups: { [key: string]: number } = {};
    
    this.usersSubject.value.forEach(user => {
      if (!signups[user.createdAt]) {
        signups[user.createdAt] = 0;
      }
      signups[user.createdAt]++;
    });

    return Object.keys(signups)
      .sort()
      .map(date => ({ date, count: signups[date] }));
  }

  // Get product sales breakdown
  getProductSalesBreakdown(): { product: string; amount: number; count: number }[] {
    const products: { [key: string]: { amount: number; count: number } } = {};
    
    this.salesSubject.value.forEach(sale => {
      if (sale.status === 'completed') {
        if (!products[sale.product]) {
          products[sale.product] = { amount: 0, count: 0 };
        }
        products[sale.product].amount += sale.amount;
        products[sale.product].count++;
      }
    });

    return Object.keys(products).map(product => ({
      product,
      ...products[product]
    }));
  }

  // Add or update user (for admin)
  saveUser(user: UserData): void {
    const users = this.usersSubject.value;
    const existingIndex = users.findIndex(u => u._id === user._id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      user._id = `user_${users.length + 1}`;
      users.push(user);
    }
    
    this.usersSubject.next([...users]);
    this.calculateMetrics();
  }

  // Delete user (for admin)
  deleteUser(userId: string): void {
    const users = this.usersSubject.value.filter(u => u._id !== userId);
    this.usersSubject.next(users);
    this.calculateMetrics();
  }

  // Get user by ID
  getUserById(userId: string): UserData | undefined {
    return this.usersSubject.value.find(u => u._id === userId);
  }

  // Get user's sales data (for regular users)
  getUserSales(userId: string): Observable<SalesData[]> {
    const sales = this.salesSubject.value.filter(s => s.userId === userId);
    return new BehaviorSubject(sales).asObservable();
  }

  // Get user's weekly purchase analytics
  getUserWeeklyAnalytics(userId: string): { week: string; amount: number; count: number }[] {
    const weeklyData: { [key: string]: { amount: number; count: number } } = {};
    const now = new Date();

    // Get last 52 weeks
    for (let w = 51; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * w));
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyData[weekKey] = { amount: 0, count: 0 };
    }

    this.salesSubject.value.forEach(sale => {
      if (sale.userId === userId && sale.status === 'completed') {
        const saleDate = new Date(sale.date);
        const weekStart = new Date(saleDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].amount += sale.amount;
          weeklyData[weekKey].count++;
        }
      }
    });

    return Object.keys(weeklyData)
      .sort()
      .map(week => ({ week, ...weeklyData[week] }));
  }

  // Get user's monthly purchase analytics
  getUserMonthlyAnalytics(userId: string): { month: string; amount: number; count: number }[] {
    const monthlyData: { [key: string]: { amount: number; count: number } } = {};

    this.salesSubject.value.forEach(sale => {
      if (sale.userId === userId && sale.status === 'completed') {
        const month = sale.date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { amount: 0, count: 0 };
        }
        monthlyData[month].amount += sale.amount;
        monthlyData[month].count++;
      }
    });

    return Object.keys(monthlyData)
      .sort()
      .map(month => ({ month, ...monthlyData[month] }));
  }

  // Get user's yearly purchase analytics
  getUserYearlyAnalytics(userId: string): { year: string; amount: number; count: number }[] {
    const yearlyData: { [key: string]: { amount: number; count: number } } = {};

    this.salesSubject.value.forEach(sale => {
      if (sale.userId === userId && sale.status === 'completed') {
        const year = sale.date.substring(0, 4); // YYYY
        if (!yearlyData[year]) {
          yearlyData[year] = { amount: 0, count: 0 };
        }
        yearlyData[year].amount += sale.amount;
        yearlyData[year].count++;
      }
    });

    return Object.keys(yearlyData)
      .sort()
      .map(year => ({ year, ...yearlyData[year] }));
  }

  // Get all users' analytics summary (for admin)
  getAllUsersAnalytics(): UserAnalytics[] {
    const users = this.usersSubject.value.filter(u => u.role === 'user');
    
    return users.map(user => {
      const userSales = this.salesSubject.value.filter(s => s.userId === user._id && s.status === 'completed');
      const totalSpent = userSales.reduce((sum, s) => sum + s.amount, 0);
      const totalOrders = userSales.length;
      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastPurchase = userSales[0];
      const lastPurchaseDate = lastPurchase ? lastPurchase.date : 'Never';
      
      // Get favorite product
      const productCounts: { [key: string]: number } = {};
      userSales.forEach(s => {
        productCounts[s.product] = (productCounts[s.product] || 0) + 1;
      });
      const favoriteProduct = Object.keys(productCounts).length > 0
        ? Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b)
        : 'N/A';

      return {
        userId: user._id,
        userName: user.fullName,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        lastPurchaseDate,
        favoriteProduct
      };
    });
  }

  // Get user's purchase analytics summary
  getUserPurchaseSummary(userId: string) {
    const userSales = this.salesSubject.value.filter(s => s.userId === userId && s.status === 'completed');
    const totalSpent = userSales.reduce((sum, s) => sum + s.amount, 0);
    const totalOrders = userSales.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      lastPurchaseDate: userSales.length > 0 ? userSales[0].date : 'N/A'
    };
  }

  // Get yearly overview
  getYearlyOverview(year?: number): Observable<any> {
    const targetYear = year || new Date().getFullYear();
    const overview = {
      success: true,
      data: {
        year: targetYear,
        totalEvents: 22,
        totalRegistrations: 912,
        totalAppeared: 789,
        totalRevenue: 425000,
        revenuePerEvent: [
          { eventName: 'Annual Fest', revenue: 45000 },
          { eventName: 'Tech Summit', revenue: 38000 },
          { eventName: 'Sports Day', revenue: 32000 },
          { eventName: 'Cultural Night', revenue: 28000 },
          { eventName: 'Workshop Series', revenue: 22000 }
        ]
      }
    };
    return new BehaviorSubject(overview).asObservable();
  }

  // Get monthly trends
  getMonthlyTrends(year?: number): Observable<any> {
    const targetYear = year || new Date().getFullYear();
    const monthlyData = [
      { month: 1, totalRegistrations: 45, totalAttended: 38, totalRevenue: 12000 },
      { month: 2, totalRegistrations: 52, totalAttended: 44, totalRevenue: 14500 },
      { month: 3, totalRegistrations: 68, totalAttended: 58, totalRevenue: 18000 },
      { month: 4, totalRegistrations: 75, totalAttended: 62, totalRevenue: 20000 },
      { month: 5, totalRegistrations: 82, totalAttended: 70, totalRevenue: 22000 },
      { month: 6, totalRegistrations: 98, totalAttended: 83, totalRevenue: 26000 },
      { month: 7, totalRegistrations: 112, totalAttended: 95, totalRevenue: 30000 },
      { month: 8, totalRegistrations: 105, totalAttended: 89, totalRevenue: 28000 },
      { month: 9, totalRegistrations: 95, totalAttended: 81, totalRevenue: 25000 },
      { month: 10, totalRegistrations: 88, totalAttended: 75, totalRevenue: 23000 },
      { month: 11, totalRegistrations: 72, totalAttended: 62, totalRevenue: 19000 },
      { month: 12, totalRegistrations: 68, totalAttended: 58, totalRevenue: 17500 }
    ];
    return new BehaviorSubject({
      success: true,
      data: monthlyData
    }).asObservable();
  }

  // Get all events
  getAllEvents(): Observable<any[]> {
    const events = [
      { _id: 'event1', name: 'Annual Fest 2024', year: 2024, status: 'completed', totalRegistrations: 245, totalAttended: 189, totalRevenue: 45000 },
      { _id: 'event2', name: 'Tech Summit 2024', year: 2024, status: 'completed', totalRegistrations: 156, totalAttended: 132, totalRevenue: 38000 },
      { _id: 'event3', name: 'Sports Day 2024', year: 2024, status: 'completed', totalRegistrations: 189, totalAttended: 156, totalRevenue: 32000 },
      { _id: 'event4', name: 'Cultural Night 2024', year: 2024, status: 'completed', totalRegistrations: 178, totalAttended: 145, totalRevenue: 28000 },
      { _id: 'event5', name: 'Workshop Series 2024', year: 2024, status: 'completed', totalRegistrations: 144, totalAttended: 121, totalRevenue: 22000 }
    ];
    return new BehaviorSubject(events).asObservable();
  }

  // Get event analytics
  getEventAnalytics(eventId?: string): Observable<any> {
    const analyticsData = {
      success: true,
      data: [
        {
          name: 'Annual Fest',
          year: 2024,
          status: 'completed',
          totalSubEvents: 8,
          totalRegistrations: 245,
          totalAttended: 189,
          totalRevenue: 45000,
          participationRate: 77.14
        },
        {
          name: 'Tech Summit',
          year: 2024,
          status: 'completed',
          totalSubEvents: 6,
          totalRegistrations: 156,
          totalAttended: 132,
          totalRevenue: 38000,
          participationRate: 84.62
        },
        {
          name: 'Sports Day',
          year: 2024,
          status: 'completed',
          totalSubEvents: 5,
          totalRegistrations: 189,
          totalAttended: 156,
          totalRevenue: 32000,
          participationRate: 82.54
        },
        {
          name: 'Cultural Night',
          year: 2024,
          status: 'completed',
          totalSubEvents: 4,
          totalRegistrations: 178,
          totalAttended: 145,
          totalRevenue: 28000,
          participationRate: 81.46
        },
        {
          name: 'Workshop Series',
          year: 2024,
          status: 'completed',
          totalSubEvents: 3,
          totalRegistrations: 144,
          totalAttended: 121,
          totalRevenue: 22000,
          participationRate: 84.03
        }
      ]
    };
    return new BehaviorSubject(analyticsData).asObservable();
  }

  // Get revenue per event
  getRevenuePerEvent(year?: number): Observable<any> {
    const data = {
      success: true,
      labels: ['Annual Fest', 'Tech Summit', 'Sports Day', 'Cultural Night', 'Workshop Series'],
      datasets: [{
        label: 'Revenue per Event',
        data: [45000, 38000, 32000, 28000, 22000],
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        borderWidth: 1
      }]
    };
    return new BehaviorSubject(data).asObservable();
  }

  // Get participation ratio
  getParticipationRatio(eventId?: string): Observable<any> {
    const data = {
      success: true,
      labels: ['Attended', 'Registered but not attended'],
      datasets: [{
        data: [650, 150],
        backgroundColor: ['#4CAF50', '#BDBDBD'],
        borderColor: ['#388E3C', '#9E9E9E'],
        borderWidth: 2
      }]
    };
    return new BehaviorSubject(data).asObservable();
  }
}

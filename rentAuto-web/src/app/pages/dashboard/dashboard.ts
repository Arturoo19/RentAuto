import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { CarsService } from '../../services/cars';
import { Reservas } from '../../services/reservas';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  isAdmin = false;
  loading = true;
  userName = '';

  monthlyGrowth = 0;

  revenueToday = 0;
  revenueWeek = 0;

  idleCars: any[] = [];
  idleCount = 0;
  idleChartSeries: number[] = [];
  idleChartLabels: string[] = ['Activos', 'Inactivos'];

  // метрики адміна
  fleetCount = 0;
  totalRentals = 0;
  revenueTotal = 0;
  statusActive = 0;
  statusCompleted = 0;
  avgRentalDays = 0;

  // метрики юзера
  myRentalsCount = 0;
  myActive = 0;
  myCompleted = 0;
  mySpent = 0;
  loadError = '';

  // топ машини
  topCarsList: any[] = [];

  // графік місячний
  revenueChartSeries: any[] = [];
  chartOptions: any = {
    chart: {
      type: 'line',
      height: 220,
      background: 'transparent',
      toolbar: { show: false },
      foreColor: '#555',
    },
    colors: ['#d6001c', '#444'],
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#1a1a1a', strokeDashArray: 4 },
    xaxis: {
      categories: [] as string[],
      labels: { style: { colors: '#555', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    tooltip: { theme: 'dark' },
    legend: { labels: { colors: '#555' } },
  };

  // графік статусів
  statusChartSeries: number[] = [];
  statusChartLabels: string[] = [];
  donutOptions: any = {
    chart: { type: 'donut', height: 220, background: 'transparent', foreColor: '#555' },
    colors: ['#d6001c', '#1565c0'],
    legend: { position: 'bottom', labels: { colors: '#888' } },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: { show: true, total: { show: true, label: 'Total', color: '#555' } },
        },
      },
    },
    tooltip: { theme: 'dark' },
  };

  // графік по днях тижня
  weekdayChartSeries: any[] = [];
  weekdayOptions: any = {};

  constructor(
    private auth: AuthService,
    private cars: CarsService,
    private reservas: Reservas,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.userName = user?.name || user?.email || '';
    this.isAdmin = user?.role === 'admin';

    if (this.isAdmin) {
      this.loadAdmin();
    } else {
      this.loadUser();
    }
  }

  private loadAdmin() {
    forkJoin({
      cars: this.cars.getCars(),
      rentals: this.reservas.syncAdminRentalsCompletingExpired().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ cars, rentals }) => {
        this.loadError = '';
        this.fleetCount = cars?.length ?? 0;
        const list = this.reservas.filterActiveOrCompletedRentals(rentals ?? []);

        this.totalRentals = list.length;
        this.revenueTotal = list.reduce((sum, r) => sum + (Number(r?.totalPrice) || 0), 0);
        this.statusActive = list.filter(
          (r) => this.reservas.normalizeStatus(r?.status) === 'active',
        ).length;
        this.statusCompleted = list.filter(
          (r) => this.reservas.normalizeStatus(r?.status) === 'completed',
        ).length;

        // середній час оренди
        const validDurations = list
          .map((r) => this.getRentalDays(r?.startDate, r?.endDate))
          .filter((days): days is number => days != null);
        const totalDays = validDurations.reduce((sum, days) => sum + days, 0);
        this.avgRentalDays =
          validDurations.length > 0 ? Math.round(totalDays / validDurations.length) : 0;

        this.calculateExtraMetrics(list, cars);

        this.prepareCharts(list);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'No se pudieron cargar las métricas del panel.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private calculateExtraMetrics(rentals: any[], cars: any[]) {
    const now = new Date();

    //  GROWTH (місяць до місяця)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    rentals.forEach((r) => {
      const date = this.parseDate(r?.startDate);
      if (!date) return;

      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        thisMonthRevenue += Number(r.totalPrice) || 0;
      }

      const lastMonthDate = new Date(currentYear, currentMonth - 1);

      if (
        date.getMonth() === lastMonthDate.getMonth() &&
        date.getFullYear() === lastMonthDate.getFullYear()
      ) {
        lastMonthRevenue += Number(r.totalPrice) || 0;
      }
    });

    this.monthlyGrowth =
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

    //  TODAY / WEEK
    const todayStr = now.toDateString();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    rentals.forEach((r) => {
      const date = this.parseDate(r?.createdAt ?? r?.bookingDate);
      if (!date) return;

      if (date.toDateString() === todayStr) {
        this.revenueToday += Number(r.totalPrice) || 0;
      }

      if (date >= startOfWeek) {
        this.revenueWeek += Number(r.totalPrice) || 0;
      }
    });

    const lastRentalMap: Record<string, Date> = {};

    rentals.forEach((r) => {
      if (!r.car) return;
      const id = String(r.car.id);
      const end = this.parseDate(r?.endDate);
      if (!end) return;

      if (!lastRentalMap[id] || end > lastRentalMap[id]) {
        lastRentalMap[id] = end;
      }
    });

    const idleThresholdDays = 7;

    this.idleCars = cars.filter((car: any) => {
      const last = lastRentalMap[String(car.id)];
      if (!last) return true;

      const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > idleThresholdDays;
    });

    this.idleCount = this.idleCars.length;
  }

  private prepareCharts(rentals: any[]) {
    this.prepareMonthlyChart(rentals);
    this.prepareWeekdayChart(rentals);
    this.prepareTopCars(rentals);

    this.statusChartSeries = [this.statusActive, this.statusCompleted];
    this.statusChartLabels = ['Activas', 'Completadas'];
    this.idleChartSeries = [this.fleetCount - this.idleCount, this.idleCount];
  }

  private prepareMonthlyChart(rentals: any[]) {
    const monthMap: Record<string, { revenue: number; count: number }> = {};

    rentals.forEach((r) => {
      const date = this.parseDate(r?.startDate);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, count: 0 };
      monthMap[key].revenue += Number(r.totalPrice) || 0;
      monthMap[key].count += 1;
    });

    const sortedMonths = Object.keys(monthMap).sort();
    const categories = sortedMonths.map((k) => {
      const [year, month] = k.split('-');
      return new Date(+year, +month - 1).toLocaleString('es', { month: 'short', year: '2-digit' });
    });

    this.revenueChartSeries = [
      { name: 'Ingresos (€)', data: sortedMonths.map((k) => Math.round(monthMap[k].revenue)) },
      { name: 'Alquileres', data: sortedMonths.map((k) => monthMap[k].count) },
    ];

    this.chartOptions = {
      ...this.chartOptions,
      xaxis: { ...this.chartOptions.xaxis, categories },
    };
  }

  private prepareWeekdayChart(rentals: any[]) {
    const dayCount = [0, 0, 0, 0, 0, 0, 0];

    rentals.forEach((r) => {
      const current = this.parseDate(r?.startDate);
      const end = this.parseDate(r?.endDate);
      if (!current || !end) return;
      while (current <= end) {
        const d = current.getDay();
        dayCount[d === 0 ? 6 : d - 1]++;
        current.setDate(current.getDate() + 1);
      }
    });

    this.weekdayChartSeries = [{ name: 'Alquileres', data: [...dayCount] }];
    this.weekdayOptions = {
      chart: {
        type: 'bar',
        height: 220,
        background: 'transparent',
        toolbar: { show: false },
        foreColor: '#555',
      },
      colors: ['#d6001c'],
      plotOptions: { bar: { borderRadius: 2, columnWidth: '60%' } },
      grid: { borderColor: '#1a1a1a', strokeDashArray: 4 },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        labels: { style: { colors: '#555', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      tooltip: { theme: 'dark' },
      dataLabels: { enabled: false },
    };
  }

  private prepareTopCars(rentals: any[]) {
    const carMap: Record<string, { name: string; count: number; revenue: number }> = {};

    rentals.forEach((r) => {
      if (!r.car) return;
      const key = String(r.car.id);
      if (!carMap[key])
        carMap[key] = { name: `${r.car.brand} ${r.car.model}`, count: 0, revenue: 0 };
      carMap[key].count++;
      carMap[key].revenue += Number(r.totalPrice) || 0;
    });

    this.topCarsList = Object.values(carMap)
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return b.revenue - a.revenue;
      })
      .slice(0, 3);
  }

  private loadUser() {
    this.reservas.syncMyRentalsCompletingExpired().subscribe({
      next: (list) => {
        this.loadError = '';
        const rentals = this.reservas.filterActiveOrCompletedRentals(list ?? []);
        this.myRentalsCount = rentals.length;
        this.myActive = rentals.filter(
          (r) => this.reservas.normalizeStatus(r?.status) === 'active',
        ).length;
        this.myCompleted = rentals.filter(
          (r) => this.reservas.normalizeStatus(r?.status) === 'completed',
        ).length;
        this.mySpent = rentals.reduce((sum, r) => sum + (Number(r?.totalPrice) || 0), 0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'No se pudieron cargar tus datos en este momento.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private parseDate(value: string | undefined): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private getRentalDays(startDate: string | undefined, endDate: string | undefined): number | null {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    if (!start || !end) return null;
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return null;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
}

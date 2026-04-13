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
  // стан
  isAdmin = false;
  loading = true;
  userName = '';

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
        this.fleetCount = cars?.length ?? 0;
        const list = this.reservas.filterActiveOrCompletedRentals(rentals ?? []);

        this.totalRentals = list.length;
        this.revenueTotal = list.reduce((sum, r) => sum + (Number(r?.totalPrice) || 0), 0);
        this.statusActive = list.filter((r) => r?.status === 'active').length;
        this.statusCompleted = list.filter((r) => r?.status === 'completed').length;

        // середній час оренди
        const totalDays = list.reduce((sum, r) => {
          const days = Math.ceil(
            (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return sum + days;
        }, 0);
        this.avgRentalDays = list.length > 0 ? Math.round(totalDays / list.length) : 0;

        this.prepareCharts(list);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private prepareCharts(rentals: any[]) {
    this.prepareMonthlyChart(rentals);
    this.prepareWeekdayChart(rentals);
    this.prepareTopCars(rentals);

    this.statusChartSeries = [this.statusActive, this.statusCompleted];
    this.statusChartLabels = ['Activas', 'Completadas'];
  }

  private prepareMonthlyChart(rentals: any[]) {
    const monthMap: Record<string, { revenue: number; count: number }> = {};

    rentals.forEach((r) => {
      const date = new Date(r.startDate);
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
      const current = new Date(r.startDate);
      const end = new Date(r.endDate);
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
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  private loadUser() {
    this.reservas.syncMyRentalsCompletingExpired().subscribe({
      next: (list) => {
        const rentals = this.reservas.filterActiveOrCompletedRentals(list ?? []);
        this.myRentalsCount = rentals.length;
        this.myActive = rentals.filter((r) => r?.status === 'active').length;
        this.myCompleted = rentals.filter((r) => r?.status === 'completed').length;
        this.mySpent = rentals.reduce((sum, r) => sum + (Number(r?.totalPrice) || 0), 0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}

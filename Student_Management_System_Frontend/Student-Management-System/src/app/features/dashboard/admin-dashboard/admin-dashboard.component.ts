import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { AppBadgeComponent } from '../../../shared/components/app-badge/app-badge.component';
import { AppSkeletonComponent } from '../../../shared/components/app-skeleton/app-skeleton.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, BaseChartDirective, KpiCardComponent, AppBadgeComponent, AppSkeletonComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr  = inject(ChangeDetectorRef);

  loading = true;
  today   = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  kpis = { users: 0, students: 0, faculty: 0, projects: 0, tasks: 0 };
  recentProjects: any[] = [];
  recentTasks:    any[] = [];

  doughnutData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#94a3b8','#6366f1','#22c55e','#f59e0b','#ef4444'], borderWidth: 0 }]
  };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { family: 'Inter', size: 12 } } } }
  };

  barData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ label: 'Tasks', data: [], backgroundColor: ['#94a3b8','#0ea5e9','#f59e0b','#ef4444'], borderRadius: 6 }]
  };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#e2e8f0' }, ticks: { font: { family: 'Inter', size: 11 }, precision: 0 } }
    }
  };

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/dashboard/stats`).subscribe({
      next: data => {
        this.kpis = {
          users:    data.totalUsers,
          students: data.studentCount,
          faculty:  data.facultyCount,
          projects: data.totalProjects,
          tasks:    data.totalTasks
        };

        this.recentProjects = data.recentProjects ?? [];
        this.recentTasks    = data.recentTasks    ?? [];

        // Build doughnut from projectStatusDist
        const dist: { statusName: string; count: number }[] = data.projectStatusDist ?? [];
        this.doughnutData = {
          labels: dist.map(d => d.statusName),
          datasets: [{ ...this.doughnutData.datasets[0], data: dist.map(d => d.count) }]
        };

        // Build bar from taskPriorityDist
        const pDist: { priorityName: string; count: number }[] = data.taskPriorityDist ?? [];
        this.barData = {
          labels: pDist.map(d => d.priorityName),
          datasets: [{ ...this.barData.datasets[0], data: pDist.map(d => d.count) }]
        };

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  mapCss(raw: string): string {
    const map: Record<string, string> = {
      'bg-success': 'badge-success', 'bg-warning': 'badge-warning',
      'bg-danger':  'badge-danger',  'bg-primary': 'badge-primary',
      'bg-secondary': 'badge-secondary', 'bg-dark': 'badge-secondary'
    };
    return map[raw] ?? raw ?? 'badge-secondary';
  }

  formatDate(val: string): string {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
  }
}

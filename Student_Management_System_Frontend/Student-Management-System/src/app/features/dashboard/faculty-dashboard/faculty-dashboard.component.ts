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
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, BaseChartDirective, KpiCardComponent, AppBadgeComponent, AppSkeletonComponent],
  templateUrl: './faculty-dashboard.component.html',
  styleUrls: ['./faculty-dashboard.component.css']
})
export class FacultyDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr  = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  loading  = true;
  kpis     = { projects: 0, activeTasks: 0, completed: 0, students: 0 };
  upcoming: any[] = [];

  barData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ label: 'Progress %', data: [], backgroundColor: '#6366f1', borderRadius: 6 }]
  };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { min: 0, max: 100, grid: { color: '#e2e8f0' }, ticks: { font: { family: 'Inter', size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
    }
  };

  get currentUser() { return this.auth.currentUser(); }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/faculty/dashboard/stats`).subscribe({
      next: data => {
        this.kpis = {
          projects:    data.totalProjects,
          activeTasks: data.activeTasks,
          completed:   data.completedProjects,
          students:    data.studentCount
        };

        this.upcoming = data.upcoming ?? [];

        const progress: { projectTitle: string; progressPercentage: number }[] = data.projectProgress ?? [];
        this.barData = {
          labels: progress.map(p =>
            p.projectTitle.length > 30 ? p.projectTitle.substring(0, 30) + '…' : p.projectTitle
          ),
          datasets: [{ ...this.barData.datasets[0], data: progress.map(p => p.progressPercentage) }]
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

  formatDate(val?: string): string {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' });
  }

  isOverdue(dueDate?: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }
}

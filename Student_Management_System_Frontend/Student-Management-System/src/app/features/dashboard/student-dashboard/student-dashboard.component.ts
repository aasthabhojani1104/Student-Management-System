import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { AppBadgeComponent } from '../../../shared/components/app-badge/app-badge.component';
import { AppSkeletonComponent } from '../../../shared/components/app-skeleton/app-skeleton.component';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, KpiCardComponent, AppBadgeComponent, AppSkeletonComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr  = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  loading   = true;
  kpis      = { projects: 0, tasks: 0, completed: 0, score: 0 };
  projects: any[] = [];
  upcoming: any[] = [];

  get currentUser() { return this.auth.currentUser(); }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/student/dashboard/stats`).subscribe({
      next: data => {
        this.kpis = {
          projects:  data.totalProjects,
          tasks:     data.totalTasks,
          completed: data.completedTasks,
          score:     data.scorePercent ?? 0
        };

        this.projects = data.myProjects  ?? [];
        this.upcoming = data.upcoming    ?? [];

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

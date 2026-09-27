import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get apiUrl(): string {
    const role = this.auth.currentRole();
    switch (role) {
      case 'Admin':   return `${environment.apiUrl}/admin/projects`;
      case 'Faculty': return `${environment.apiUrl}/faculty/projects`;
      case 'Student': return `${environment.apiUrl}/student/projects`;
      default:        return `${environment.apiUrl}/admin/projects`;
    }
  }

  private cache$: Observable<Project[]> | null = null;

  private mapCssClass(raw: string): string {
    if (!raw) return 'badge-secondary';
    const map: Record<string, string> = {
      'bg-success':   'badge-success',
      'bg-warning':   'badge-warning',
      'bg-danger':    'badge-danger',
      'bg-primary':   'badge-primary',
      'bg-secondary': 'badge-secondary',
      'bg-info':      'badge-info',
      'bg-dark':      'badge-secondary',
    };
    return map[raw.trim()] ?? raw;
  }

  private normalise(raw: any): Project {
    return {
      projectId:          raw.projectId          ?? raw.ProjectId,
      projectTitle:       raw.projectTitle        ?? raw.ProjectTitle       ?? '',
      description:        raw.description         ?? raw.Description,
      facultyId:          raw.facultyId           ?? raw.FacultyId          ?? 0,
      facultyName:        raw.facultyName         ?? raw.FacultyName,
      projectStatus:      raw.projectStatus       ?? raw.ProjectStatus      ?? 0,
      statusName:         raw.statusName          ?? raw.StatusName,
      statusCssClass:     this.mapCssClass(raw.statusCssClass ?? raw.StatusCssClass ?? ''),
      assignedDate:       raw.assignedDate        ?? raw.AssignedDate       ?? '',
      startDate:          raw.startDate           ?? raw.StartDate          ?? '',
      endDate:            raw.endDate             ?? raw.EndDate            ?? '',
      totalTasks:         raw.totalTasks          ?? raw.TotalTasks         ?? 0,
      completedTasks:     raw.completedTasks      ?? raw.CompletedTasks     ?? 0,
      progressPercentage: raw.progressPercentage  ?? raw.ProgressPercentage ?? 0,
      studentId:          raw.studentId           ?? raw.StudentId          ?? 0,
      studentName:        raw.studentName         ?? raw.StudentName,
      allocationId:       raw.allocationId        ?? raw.AllocationId
    };
  }

  invalidateCache(): void { this.cache$ = null; }

  getAll(): Observable<Project[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<any[]>(this.apiUrl).pipe(
        map(list => list.map(r => this.normalise(r))),
        tap({ error: () => this.invalidateCache() }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  getById(id: number): Observable<Project> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.normalise(r))
    );
  }

  getByFaculty(facultyId: number): Observable<Project[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/faculty/projects`).pipe(
      map(list => list.map(r => this.normalise(r)))
    );
  }

  getByStudent(studentId: number): Observable<Project[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/student/projects`).pipe(
      map(list => list.map(r => this.normalise(r)))
    );
  }

  add(p: Partial<Project>): Observable<Project> {
    return this.http.post<any>(this.apiUrl, p).pipe(
      map(r => this.normalise(r)),
      tap(() => this.invalidateCache())
    );
  }

  update(p: Project): Observable<void> {
    return this.http.put(`${this.apiUrl}/${p.projectId}`, p, { responseType: 'text' }).pipe(
      map(() => void 0),
      tap(() => this.invalidateCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      map(() => void 0),
      tap(() => this.invalidateCache())
    );
  }
}

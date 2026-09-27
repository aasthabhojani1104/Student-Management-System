import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // Routes differ per role
  private get apiUrl(): string {
    const role = this.auth.currentRole();
    switch (role) {
      case 'Admin':   return `${environment.apiUrl}/admin/tasks`;
      case 'Faculty': return `${environment.apiUrl}/faculty/tasks`;
      case 'Student': return `${environment.apiUrl}/student/tasks`;
      default:        return `${environment.apiUrl}/admin/tasks`;
    }
  }

  private cache$: Observable<Task[]> | null = null;

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

  private normalise(raw: any): Task {
    return {
      taskId:             raw.taskId             ?? raw.TaskId,
      projectId:          raw.allocationId       ?? raw.AllocationId       ?? 0,
      projectTitle:       raw.projectTitle        ?? raw.ProjectTitle,
      taskTitle:          raw.taskTitle           ?? raw.TaskTitle          ?? '',
      taskDescription:    raw.taskDescription     ?? raw.TaskDescription,
      taskStatus:         raw.taskStatus          ?? raw.TaskStatus         ?? 0,
      statusName:         raw.statusName          ?? raw.StatusName,
      statusCssClass:     this.mapCssClass(raw.statusCssClass ?? raw.StatusCssClass ?? ''),
      priorityId:         raw.priorityId          ?? raw.PriorityId         ?? 0,
      priorityName:       raw.priorityName        ?? raw.PriorityName,
      priorityCssClass:   this.mapCssClass(raw.priorityCssClass ?? raw.PriorityCssClass ?? ''),
      assignedScore:      raw.assignedScore       ?? raw.AssignedScore      ?? 0,
      earnedScore:        raw.earnedScore         ?? raw.EarnedScore,
      progressPercentage: raw.progressPercentage  ?? raw.ProgressPercentage ?? 0,
      startDate:          raw.startDate           ?? raw.StartDate,
      dueDate:            raw.dueDate             ?? raw.DueDate,
      completedDate:      raw.completedDate       ?? raw.CompletedDate,
      facultyRemarks:     raw.facultyRemarks      ?? raw.FacultyRemarks,
      studentRemarks:     raw.studentRemarks      ?? raw.StudentRemarks,
      assignedStudentName: raw.studentName        ?? raw.StudentName
    };
  }

  invalidateCache(): void { this.cache$ = null; }

  getAll(): Observable<Task[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<any[]>(this.apiUrl).pipe(
        map(list => list.map(r => this.normalise(r))),
        tap({ error: () => this.invalidateCache() }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  getByProject(allocationId: number): Observable<Task[]> {
    return this.http
      .get<any[]>(`${environment.apiUrl}/admin/tasks`)
      .pipe(
        map(list =>
          list
            .map(r => this.normalise(r))
            .filter(t => t.projectId === allocationId)
        )
      );
  }

  getByStudent(studentId: number): Observable<Task[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/student/tasks`).pipe(
      map(list => list.map(r => this.normalise(r)))
    );
  }

  add(t: Partial<Task>): Observable<Task> {
    // Map frontend Task shape to backend TaskDto shape
    const payload = {
      allocationId:    t.projectId,       // frontend stores allocationId in projectId
      taskTitle:       t.taskTitle,
      taskDescription: t.taskDescription,
      taskStatus:      t.taskStatus,
      priorityId:      t.priorityId,
      assignedScore:   t.assignedScore    ?? 0,
      earnedScore:     t.earnedScore,
      progressPercentage: t.progressPercentage ?? 0,
      startDate:       t.startDate,
      dueDate:         t.dueDate,
      completedDate:   t.completedDate,
      facultyRemarks:  t.facultyRemarks,
      studentRemarks:  t.studentRemarks
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(r => this.normalise(r)),
      tap(() => this.invalidateCache())
    );
  }

  update(t: Task): Observable<Task> {
    const payload = {
      allocationId:    t.projectId,
      taskTitle:       t.taskTitle,
      taskDescription: t.taskDescription,
      taskStatus:      t.taskStatus,
      priorityId:      t.priorityId,
      assignedScore:   t.assignedScore    ?? 0,
      earnedScore:     t.earnedScore,
      progressPercentage: t.progressPercentage ?? 0,
      startDate:       t.startDate,
      dueDate:         t.dueDate,
      completedDate:   t.completedDate,
      facultyRemarks:  t.facultyRemarks,
      studentRemarks:  t.studentRemarks
    };
    return this.http.put<any>(`${this.apiUrl}/${t.taskId}`, payload, { responseType: 'text' as 'json' }).pipe(
      map(() => t),
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

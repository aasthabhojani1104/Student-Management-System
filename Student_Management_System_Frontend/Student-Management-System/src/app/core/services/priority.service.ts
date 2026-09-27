import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Priority } from '../models/priority.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PriorityService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/priorities`;

  private cache$: Observable<Priority[]> | null = null;

  private mapCssClass(raw: string): string {
    if (!raw) return 'badge-secondary';
    const map: Record<string, string> = {
      'bg-success':   'badge-success',
      'bg-warning':   'badge-warning',
      'bg-danger':    'badge-danger',
      'bg-primary':   'badge-primary',
      'bg-secondary': 'badge-secondary',
      'bg-dark':      'badge-secondary',
    };
    return map[raw.trim()] ?? raw;
  }

  private normalise(raw: any): Priority {
    const id = raw.priorityId ?? raw.PriorityId ?? raw.priorityID ?? raw.PriorityID;
    return {
      priorityId:       id,
      priorityName:     raw.priorityName     ?? raw.PriorityName     ?? '',
      priorityCssClass: this.mapCssClass(raw.priorityCssClass ?? raw.PriorityCssClass ?? '')
    };
  }

  invalidateCache(): void { this.cache$ = null; }

  getAll(): Observable<Priority[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<any[]>(this.apiUrl).pipe(
        map(list => list.map(r => this.normalise(r))),
        tap({ error: () => this.invalidateCache() }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  add(p: Partial<Priority>): Observable<Priority> {
    return this.http.post<any>(this.apiUrl, p).pipe(
      map(r => this.normalise(r)),
      tap(() => this.invalidateCache())
    );
  }

  update(p: Priority): Observable<void> {
    return this.http.put(`${this.apiUrl}/${p.priorityId}`, p, { responseType: 'text' }).pipe(
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

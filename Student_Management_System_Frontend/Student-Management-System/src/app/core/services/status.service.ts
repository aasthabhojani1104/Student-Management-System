import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Status } from '../models/status.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/status`;

  private cache$: Observable<Status[]> | null = null;

  // Map Bootstrap bg-* classes → SPMS badge-* classes
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
      'bg-light':     'badge-secondary',
    };
    return map[raw.trim()] ?? raw;
  }

  private normalise(raw: any): Status {
    const cssRaw = raw.statusCssClass ?? raw.StatusCssClass ?? '';
    return {
      statusId:       raw.statusId       ?? raw.StatusId,
      statusName:     raw.statusName     ?? raw.StatusName     ?? '',
      statusCssClass: this.mapCssClass(cssRaw)
    };
  }

  invalidateCache(): void { this.cache$ = null; }

  getAll(): Observable<Status[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<any[]>(this.apiUrl).pipe(
        map(list => list.map(r => this.normalise(r))),
        tap({ error: () => this.invalidateCache() }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  add(s: Partial<Status>): Observable<Status> {
    return this.http.post<any>(this.apiUrl, s).pipe(
      map(r => this.normalise(r)),
      tap(() => this.invalidateCache())
    );
  }

  update(s: Status): Observable<void> {
    return this.http.put(`${this.apiUrl}/${s.statusId}`, s, { responseType: 'text' }).pipe(
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

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../models/role.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/roles`;

  // Cached observable — shared across all subscribers, replays last value instantly
  private cache$: Observable<Role[]> | null = null;

  /** Normalise backend response → camelCase to match Role model */
  private normalise(raw: any): Role {
    return {
      roleId:      raw.roleId      ?? raw.RoleId      ?? raw.id   ?? raw.Id,
      roleName:    raw.roleName    ?? raw.RoleName    ?? raw.name ?? raw.Name ?? '',
      description: raw.description ?? raw.Description ?? undefined
    };
  }

  /** Invalidate the cache so the next getAll() hits the API again */
  invalidateCache(): void {
    this.cache$ = null;
  }

  getAll(): Observable<Role[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<any[]>(this.apiUrl).pipe(
        map(list => list.map(r => this.normalise(r))),
        shareReplay({ bufferSize: 1, refCount: true })   // replay the last emitted value to late subscribers
      );
    }
    return this.cache$;
  }

  add(r: Partial<Role>): Observable<Role> {
    return this.http.post<any>(this.apiUrl, r).pipe(
      map(res => this.normalise(res)),
      tap(() => this.invalidateCache())   // force fresh list after write
    );
  }

  update(r: Role): Observable<void> {
    return this.http.put(`${this.apiUrl}/${r.roleId}`, r, { responseType: 'text' }).pipe(
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

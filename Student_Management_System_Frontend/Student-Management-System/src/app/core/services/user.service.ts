import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http    = inject(HttpClient);
  private apiUrl  = `${environment.apiUrl}/users`;
  private baseUrl = environment.apiUrl.replace('/api', '');  // https://localhost:7029

  private cache$: Observable<User[]> | null = null;

  private normalise(raw: any): User {
    return {
      userId:             raw.userId             ?? raw.UserId,
      fullName:           raw.fullName           ?? raw.FullName           ?? '',
      email:              raw.email              ?? raw.Email              ?? '',
      mobileNumber:       raw.mobileNumber       ?? raw.MobileNumber       ?? '',
      profilePicturePath: raw.profilePicturePath ?? raw.ProfilePicturePath ?? undefined,
      isActive:           raw.isActive           ?? raw.IsActive           ?? true,
      isDeleted:          raw.isDeleted          ?? raw.IsDeleted          ?? false,
      roleId:             raw.roleId             ?? raw.RoleId             ?? undefined,
      roleName:           raw.roleName           ?? raw.RoleName           ?? undefined,
      createdAt:          raw.createdAt          ?? raw.CreatedAt          ?? undefined,
      updatedAt:          raw.updatedAt          ?? raw.UpdatedAt          ?? undefined,
      password:           undefined              // never carry password from response
    };
  }

  invalidateCache(): void { this.cache$ = null; }

  getAll(): Observable<User[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<any[]>(this.apiUrl).pipe(
        map(list => list.map(r => this.normalise(r))),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  getById(id: number): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.normalise(r))
    );
  }

  add(u: Partial<User>): Observable<User> {
    return this.http.post<any>(this.apiUrl, u).pipe(
      map(r => this.normalise(r)),
      tap(() => this.invalidateCache())
    );
  }

  update(u: User): Observable<void> {
    const { password, isDeleted, createdAt, updatedAt, roleName, ...body } = u;
    const sendBody = password?.trim() ? { ...body, password } : body;
    return this.http.put(`${this.apiUrl}/${u.userId}`, sendBody, { responseType: 'text' }).pipe(
      map(() => void 0),
      tap(() => this.invalidateCache())
    );
  }

  uploadAvatar(userId: number, file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/${userId}/avatar`, form).pipe(
      tap(() => this.invalidateCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      map(() => void 0),
      tap(() => this.invalidateCache())
    );
  }

  /** Returns the full URL for a stored profile picture path */
  getAvatarUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;        // already absolute
    return `${this.baseUrl}${path}`;                 // prepend base URL
  }
}

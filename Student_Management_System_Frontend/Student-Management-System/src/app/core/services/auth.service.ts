import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'spms_token';
const USER_KEY  = 'spms_user';

export interface LoginResponse {
  token:    string;
  userId:   number;
  fullName: string;
  email:    string;
  role:     string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId   = inject(PLATFORM_ID);
  private isBrowser    = isPlatformBrowser(this.platformId);
  private http         = inject(HttpClient);
  private router       = inject(Router);

  private _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = computed(() => this._currentUser() !== null);
  readonly currentRole = computed(() => this._currentUser()?.roleName ?? null);

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    if (!this.isBrowser) return;
    const stored = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const user: User = JSON.parse(atob(stored));
        this._currentUser.set(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  // Returns an Observable — caller subscribes and handles success/error
  login(email: string, password: string, rememberMe = false): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/users/login`, { email, password })
      .pipe(
        tap(res => {
          const user: User = {
            userId:   res.userId,
            fullName: res.fullName,
            email:    res.email,
            roleName: res.role,
            isActive: true
          };

          const encoded = btoa(JSON.stringify(user));

          if (this.isBrowser) {
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem(TOKEN_KEY, res.token);
            storage.setItem(USER_KEY, encoded);
          }

          this._currentUser.set(user);
        })
      );
  }

  logout(): void {
    this._currentUser.set(null);
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this._currentUser() !== null;
  }

  hasRole(role: string): boolean {
    return this._currentUser()?.roleName === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const roleName = this._currentUser()?.roleName;
    return roleName ? roles.includes(roleName) : false;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  getDashboardRoute(): string {
    const role = this._currentUser()?.roleName;
    switch (role) {
      case 'Admin':   return '/dashboard/admin';
      case 'Faculty': return '/dashboard/faculty';
      case 'Student': return '/dashboard/student';
      default:        return '/auth/login';
    }
  }

  updateCurrentUser(user: Partial<User>): void {
    const current = this._currentUser();
    if (!current) return;
    const updated = { ...current, ...user };
    this._currentUser.set(updated);
    if (this.isBrowser) {
      const encoded = btoa(JSON.stringify(updated));
      if (localStorage.getItem(USER_KEY)) localStorage.setItem(USER_KEY, encoded);
      else sessionStorage.setItem(USER_KEY, encoded);
    }
  }

  private clearStorage(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}

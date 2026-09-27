import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private router  = inject(Router);

  readonly year = new Date().getFullYear();

  showPassword = false;
  loading      = false;
  error        = '';

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.getDashboardRoute()]);
    }
  }

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [false]
  });

  demoCredentials = [
    { label: 'Admin',   email: 'admin@spms.com', password: 'Admin@123', icon: 'admin_panel_settings', color: '#6366f1' },
    { label: 'Faculty', email: 'priya@spms.com',  password: 'Admin@123', icon: 'school',               color: '#0ea5e9' },
    { label: 'Student', email: 'rahul@spms.com',  password: 'Admin@123', icon: 'person',               color: '#22c55e' }
  ];

  fillDemo(cred: { email: string; password: string }): void {
    this.form.patchValue({ email: cred.email, password: cred.password });
    this.error = '';
  }

  get emailCtrl()    { return this.form.get('email')!; }
  get passwordCtrl() { return this.form.get('password')!; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error   = '';

    const { email, password, rememberMe } = this.form.value;

    this.auth.login(email!, password!, rememberMe ?? false).subscribe({
      next: () => {
        this.router.navigate([this.auth.getDashboardRoute()]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = err.error?.message ?? 'Invalid email or password.';
        } else {
          this.error = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}

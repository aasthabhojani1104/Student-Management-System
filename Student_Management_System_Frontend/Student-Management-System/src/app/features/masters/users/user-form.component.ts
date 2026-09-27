import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input()  user?: User;
  @Input()  lockedRoleId?: number;
  @Output() saved     = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb          = inject(FormBuilder);
  private service     = inject(UserService);
  private roleService = inject(RoleService);
  private toast       = inject(ToastService);
  private cdr         = inject(ChangeDetectorRef);

  saving       = false;
  showPassword = false;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  roles: Role[] = [];

  form = this.fb.group({
    fullName:     ['', [Validators.required, Validators.maxLength(150)]],
    email:        ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password:     ['', [Validators.minLength(8)]],
    mobileNumber: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
    roleId:       [null as number | null],
    isActive:     [true]
  });

  ngOnInit(): void {
    this.roleService.getAll().subscribe(r => {
      this.roles = r;
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      if (this.user) {
        this.form.patchValue({
          fullName:     this.user.fullName,
          email:        this.user.email,
          mobileNumber: this.user.mobileNumber ?? '',
          isActive:     this.user.isActive,
          password:     '',
          roleId:       this.lockedRoleId ?? this.user.roleId ?? null
        });
        this.previewUrl  = this.user.profilePicturePath
          ? `https://localhost:7029${this.user.profilePicturePath}`
          : null;
        this.selectedFile = null;
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      } else {
        this.form.reset({ isActive: true, password: '', roleId: this.lockedRoleId ?? null });
        this.previewUrl   = null;
        this.selectedFile = null;
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('password')?.updateValueAndValidity();
      }
    }
  }

  getInitials(): string {
    const name = this.form.get('fullName')?.value || this.user?.fullName || '';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = e => { this.previewUrl = e.target?.result as string; };
      reader.readAsDataURL(input.files[0]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.form.getRawValue();

    // Only send profilePicturePath if it's a real stored path (not a base64 blob)
    const picturePath = (this.previewUrl && !this.previewUrl.startsWith('data:'))
      ? this.previewUrl
      : this.user?.profilePicturePath ?? undefined;

    // Build base payload without password
    const payload: Partial<User> = {
      userId:             this.user?.userId ?? 0,
      fullName:           raw.fullName ?? '',
      email:              raw.email ?? '',
      mobileNumber:       raw.mobileNumber ?? '',
      isActive:           raw.isActive ?? true,
      profilePicturePath: picturePath,
      roleId:             raw.roleId ?? this.lockedRoleId ?? undefined
    };

    if (this.user) {
      // Edit — only include password if the user typed a new one
      if (raw.password?.trim()) payload.password = raw.password;
    } else {
      // Create — password is required
      payload.password = raw.password ?? '';
    }

    const obs: Observable<unknown> = this.user
      ? this.service.update(payload as User)
      : this.service.add(payload);

    obs.subscribe({
      next: (res: any) => {
        const savedId = this.user?.userId ?? res?.userId ?? res?.UserId;
        // If a new file was selected, upload it now
        if (this.selectedFile && savedId) {
          this.service.uploadAvatar(savedId, this.selectedFile).subscribe({
            next: () => {
              this.saving = false;
              this.cdr.detectChanges();
              this.toast.success(this.user ? 'User updated!' : 'User created!');
              this.saved.emit();
            },
            error: () => {
              this.saving = false;
              this.cdr.detectChanges();
              this.toast.success(this.user ? 'User updated!' : 'User created!');
              this.toast.error('Profile picture upload failed.');
              this.saved.emit();
            }
          });
        } else {
          this.saving = false;
          this.cdr.detectChanges();
          this.toast.success(this.user ? 'User updated!' : 'User created!');
          this.saved.emit();
        }
      },
      error: (err) => {
        this.saving = false;
        this.cdr.detectChanges();
        console.error('Failed to save user:', err);
        const msg = err?.error?.message ?? 'Failed to save user.';
        this.toast.error(msg);
      }
    });
  }
}

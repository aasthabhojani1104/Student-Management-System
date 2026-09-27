import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private auth    = inject(AuthService);
  private userSvc = inject(UserService);
  private toast   = inject(ToastService);
  private fb      = inject(FormBuilder);
  private cdr     = inject(ChangeDetectorRef);

  user: User | null = null;
  editMode     = false;
  changingPwd  = false;
  savingProfile = false;
  savingPwd     = false;
  showCurrent  = false;
  showNew      = false;
  showConfirm  = false;
  previewUrl: string | null = null;

  profileForm = this.fb.group({
    fullName:     ['', [Validators.required, Validators.maxLength(100)]],
    mobileNumber: ['', [Validators.pattern(/^[6-9]\d{9}$/)]]
  });

  pwdForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatch });

  ngOnInit(): void {
    const cur = this.auth.currentUser();
    if (cur?.userId) {
      this.userSvc.getById(cur.userId).subscribe({
        next: u => {
          if (u) {
            this.user = u;
            this.profileForm.patchValue({ fullName: u.fullName, mobileNumber: u.mobileNumber ?? '' });
            this.cdr.detectChanges();
          }
        },
        error: () => this.toast.error('Failed to load profile.')
      });
    }
  }

  get avatarSrc(): string | undefined {
    return this.previewUrl ?? this.userSvc.getAvatarUrl(this.user?.profilePicturePath);
  }

  get initials(): string {
    const name = this.user?.fullName || '';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  }

  passwordMatch(group: any) {
    const np = group.get('newPassword')?.value;
    const cp = group.get('confirmPassword')?.value;
    return np && cp && np !== cp ? { mismatch: true } : null;
  }

  private selectedFile: File | null = null;

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('Image must be smaller than 2 MB');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => { this.previewUrl = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.user) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true;
    const v = this.profileForm.value;

    // If a new file was selected, upload it first then save profile
    if (this.selectedFile) {
      this.userSvc.uploadAvatar(this.user.userId, this.selectedFile).subscribe({
        next: (res: any) => {
          const avatarUrl = res?.url ?? this.user!.profilePicturePath;
          this._doSaveProfile(v, avatarUrl);
        },
        error: () => {
          this.savingProfile = false;
          this.toast.error('Failed to upload avatar');
        }
      });
    } else {
      this._doSaveProfile(v, this.user.profilePicturePath);
    }
  }

  private _doSaveProfile(v: any, profilePicturePath: string | null | undefined): void {
    const updated: User = {
      ...this.user!,
      fullName:           v.fullName!,
      mobileNumber:       v.mobileNumber || undefined,
      profilePicturePath: profilePicturePath ?? undefined
    };
    this.userSvc.update(updated).subscribe({
      next: () => {
        this.savingProfile = false;
        this.user          = updated;
        this.selectedFile  = null;
        this.editMode      = false;
        this.auth.updateCurrentUser({ fullName: updated.fullName, profilePicturePath: updated.profilePicturePath });
        this.toast.success('Profile updated successfully');
      },
      error: () => { this.savingProfile = false; this.toast.error('Failed to update profile'); }
    });
  }

  savePassword(): void {
    if (this.pwdForm.invalid || !this.user) { this.pwdForm.markAllAsTouched(); return; }
    this.savingPwd = true;
    const v = this.pwdForm.value;
    // Send new password to the real API via UpdateUser
    const payload: User = { ...this.user!, password: v.newPassword! };
    this.userSvc.update(payload).subscribe({
      next: () => {
        this.savingPwd  = false;
        this.changingPwd = false;
        this.pwdForm.reset();
        this.toast.success('Password changed successfully');
      },
      error: () => { this.savingPwd = false; this.toast.error('Failed to change password'); }
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.previewUrl = null;
    this.profileForm.patchValue({ fullName: this.user?.fullName ?? '', mobileNumber: this.user?.mobileNumber ?? '' });
  }
}

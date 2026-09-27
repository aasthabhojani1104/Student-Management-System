import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { Role } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css']
})
export class RoleFormComponent implements OnChanges {
  @Input()  role?: Role;
  @Output() saved     = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb      = inject(FormBuilder);
  private service = inject(RoleService);
  private toast   = inject(ToastService);
  private cdr     = inject(ChangeDetectorRef);

  saving = false;

  form = this.fb.group({
    roleName:    ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(255)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role']) {
      if (this.role) {
        this.form.patchValue({ roleName: this.role.roleName, description: this.role.description ?? '' });
      } else {
        this.form.reset();
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const payload = { ...this.form.value };
    const obs: Observable<unknown> = this.role
      ? this.service.update({ ...this.role, roleName: payload.roleName!, description: payload.description || undefined })
      : this.service.add({ roleName: payload.roleName!, description: payload.description || undefined });

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.cdr.detectChanges();                          // settle disabled state before emitting
        this.toast.success(this.role ? 'Role updated!' : 'Role created!');
        this.saved.emit();
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
        this.toast.error('Failed to save role.');
      }
    });
  }
}

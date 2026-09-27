import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppTableComponent, TableColumn, TableAction } from '../../../shared/components/app-table/app-table.component';
import { AppDrawerComponent } from '../../../shared/components/app-drawer/app-drawer.component';
import { AppConfirmDialogComponent } from '../../../shared/components/app-confirm-dialog/app-confirm-dialog.component';
import { PriorityService } from '../../../core/services/priority.service';
import { ToastService } from '../../../core/services/toast.service';
import { Priority } from '../../../core/models/priority.model';

@Component({
  selector: 'app-priority-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatDialogModule, AppTableComponent, AppDrawerComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Manage Priorities</h1>
          <p class="page-subtitle">Configure task priority levels used across the system</p>
        </div>
        <button class="btn btn-primary" (click)="openAdd()"><mat-icon>add</mat-icon> Add Priority</button>
      </div>
      <app-table [columns]="columns" [data]="priorities" [loading]="loading"
                 [actions]="actions" emptyMessage="No priorities found."
                 (actionClicked)="onAction($event)">
      </app-table>
    </div>

    <app-drawer [open]="drawerOpen" [title]="selected ? 'Edit Priority' : 'Add Priority'" (closed)="drawerOpen = false">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="drawer-form">
        <div class="form-group">
          <label class="form-label required">Priority Name</label>
          <input class="form-control" formControlName="priorityName" placeholder="e.g., High" maxlength="50"
                 [class.error]="form.get('priorityName')!.invalid && form.get('priorityName')!.touched">
          @if (form.get('priorityName')!.touched && form.get('priorityName')!.hasError('required')) {
            <span class="form-error">Priority name is required</span>
          }
        </div>
        <div class="form-group">
          <label class="form-label required">CSS Class</label>
          <select class="form-control" formControlName="priorityCssClass"
                  [class.error]="form.get('priorityCssClass')!.invalid && form.get('priorityCssClass')!.touched">
            <option value="" disabled>— Select Color —</option>
            <option value="bg-success">Green (Low)</option>
            <option value="bg-warning">Yellow (Medium)</option>
            <option value="bg-danger">Red (High)</option>
            <option value="bg-dark">Dark (Critical)</option>
            <option value="bg-primary">Blue</option>
            <option value="bg-secondary">Grey</option>
          </select>
          <span class="form-hint">Controls badge color shown on tasks</span>
          @if (form.get('priorityCssClass')!.value) {
            <span class="badge mt-2" [ngClass]="previewClass(form.get('priorityCssClass')!.value ?? '')">
              {{ form.get('priorityName')!.value || 'Preview' }}
            </span>
          }
        </div>
        <div class="drawer-footer">
          <button type="button" class="btn btn-secondary" (click)="drawerOpen = false">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            @if (saving) { <span class="spinner-sm"></span> }
            {{ selected ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </app-drawer>
  `,
  styles: [`.mt-2{margin-top:8px;} .spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;margin-right:4px;vertical-align:middle} @keyframes spin{to{transform:rotate(360deg)}}`]
})
export class PriorityListComponent implements OnInit {
  private service = inject(PriorityService);
  private toast   = inject(ToastService);
  private dialog  = inject(MatDialog);
  private fb      = inject(FormBuilder);
  private cdr     = inject(ChangeDetectorRef);

  loading    = true;
  saving     = false;
  priorities: Priority[] = [];
  drawerOpen = false;
  selected?: Priority;

  form = this.fb.group({
    priorityName:    ['', [Validators.required, Validators.maxLength(50)]],
    priorityCssClass:['', [Validators.required, Validators.maxLength(100)]]
  });

  columns: TableColumn[] = [
    { key: 'priorityId',       label: '#',           type: 'number',  width: '60px' },
    { key: 'priorityName',     label: 'Priority',    type: 'text',    sortable: true },
    { key: 'priorityName',     label: 'Preview',     type: 'badge',   cssClassKey: 'priorityCssClass' },
    { key: '_actions',         label: 'Actions',     type: 'actions', width: '100px' }
  ];
  actions: TableAction[] = [
    { icon: 'edit',   label: 'Edit',   color: 'primary', action: 'edit' },
    { icon: 'delete', label: 'Delete', color: 'danger',  action: 'delete' }
  ];

  ngOnInit(): void { this.load(); }

  previewClass(raw: string): string {
    const map: Record<string, string> = {
      'bg-success': 'badge-success', 'bg-primary': 'badge-primary',
      'bg-warning': 'badge-warning', 'bg-danger':  'badge-danger',
      'bg-secondary': 'badge-secondary', 'bg-dark': 'badge-secondary'
    };
    return map[raw] ?? 'badge-secondary';
  }
  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next:  p => { this.priorities = p; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); this.toast.error('Failed to load priorities.'); }
    });
  }

  openAdd(): void { this.selected = undefined; this.form.reset(); this.drawerOpen = true; }
  openEdit(p: Priority): void {
    this.selected = p;
    this.form.patchValue({ priorityName: p.priorityName, priorityCssClass: p.priorityCssClass });
    this.drawerOpen = true;
  }

  onAction(e: { action: string; row: Priority }): void {
    if (e.action === 'edit')   this.openEdit(e.row);
    if (e.action === 'delete') this.confirmDelete(e.row);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    const obs: Observable<unknown> = this.selected
      ? this.service.update({ ...this.selected, priorityName: v.priorityName!, priorityCssClass: v.priorityCssClass! })
      : this.service.add({ priorityName: v.priorityName!, priorityCssClass: v.priorityCssClass! });
    obs.subscribe({
      next: () => { this.saving = false; this.drawerOpen = false; this.toast.success(this.selected ? 'Priority updated.' : 'Priority created.'); setTimeout(() => this.load()); },
      error: () => { this.saving = false; this.toast.error('Failed to save.'); }
    });
  }

  confirmDelete(p: Priority): void {
    const ref = this.dialog.open(AppConfirmDialogComponent, {
      data: { title: 'Delete Priority', message: `Delete "${p.priorityName}"?`, danger: true, confirmLabel: 'Delete' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.service.delete(p.priorityId).subscribe({ next: () => { this.toast.success('Priority deleted.'); setTimeout(() => this.load()); } });
    });
  }
}

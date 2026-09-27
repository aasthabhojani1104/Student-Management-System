import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppTableComponent, TableColumn, TableAction } from '../../../shared/components/app-table/app-table.component';
import { AppDrawerComponent } from '../../../shared/components/app-drawer/app-drawer.component';
import { AppConfirmDialogComponent } from '../../../shared/components/app-confirm-dialog/app-confirm-dialog.component';
import { StatusService } from '../../../core/services/status.service';
import { ToastService } from '../../../core/services/toast.service';
import { Status } from '../../../core/models/status.model';

@Component({
  selector: 'app-status-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatDialogModule, AppTableComponent, AppDrawerComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Manage Statuses</h1>
          <p class="page-subtitle">Configure workflow status values used by projects and tasks</p>
        </div>
        <button class="btn btn-primary" (click)="openAdd()"><mat-icon>add</mat-icon> Add Status</button>
      </div>
      <app-table [columns]="columns" [data]="statuses" [loading]="loading"
                 [actions]="actions" emptyMessage="No statuses found."
                 (actionClicked)="onAction($event)">
      </app-table>
    </div>

    <app-drawer [open]="drawerOpen" [title]="selected ? 'Edit Status' : 'Add Status'" (closed)="drawerOpen = false">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="drawer-form">
        <div class="form-group">
          <label class="form-label required">Status Name</label>
          <input class="form-control" formControlName="statusName" placeholder="e.g., In Progress" maxlength="50"
                 [class.error]="form.get('statusName')!.invalid && form.get('statusName')!.touched">
          @if (form.get('statusName')!.touched && form.get('statusName')!.hasError('required')) {
            <span class="form-error">Status name is required</span>
          }
        </div>
        <div class="form-group">
          <label class="form-label required">CSS Class</label>
          <select class="form-control" formControlName="statusCssClass"
                  [class.error]="form.get('statusCssClass')!.invalid && form.get('statusCssClass')!.touched">
            <option value="" disabled>— Select Color —</option>
            <option value="bg-success">Green (Success)</option>
            <option value="bg-primary">Blue (Primary)</option>
            <option value="bg-warning">Yellow (Warning)</option>
            <option value="bg-danger">Red (Danger)</option>
            <option value="bg-secondary">Grey (Secondary)</option>
            <option value="bg-dark">Dark</option>
          </select>
          <span class="form-hint">This controls the badge color shown on projects and tasks</span>
          @if (form.get('statusCssClass')!.value) {
            <span class="badge mt-2" [ngClass]="previewClass(form.get('statusCssClass')!.value ?? '')">
              {{ form.get('statusName')!.value || 'Preview' }}
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
export class StatusListComponent implements OnInit {
  private service = inject(StatusService);
  private toast   = inject(ToastService);
  private dialog  = inject(MatDialog);
  private fb      = inject(FormBuilder);
  private cdr     = inject(ChangeDetectorRef);

  loading    = true;
  saving     = false;
  statuses: Status[] = [];
  drawerOpen = false;
  selected?: Status;

  form = this.fb.group({
    statusName:    ['', [Validators.required, Validators.maxLength(50)]],
    statusCssClass:['', [Validators.required, Validators.maxLength(100)]]
  });

  columns: TableColumn[] = [
    { key: 'statusId',       label: '#',         type: 'number',  width: '60px' },
    { key: 'statusName',     label: 'Status Name', type: 'text',   sortable: true },
    { key: 'statusName',     label: 'Preview',   type: 'badge',   cssClassKey: 'statusCssClass' },
    { key: '_actions',       label: 'Actions',   type: 'actions', width: '100px' }
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
      next:  s => { this.statuses = s; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); this.toast.error('Failed to load statuses.'); }
    });
  }

  openAdd(): void { this.selected = undefined; this.form.reset(); this.drawerOpen = true; }
  openEdit(s: Status): void {
    this.selected = s;
    this.form.patchValue({ statusName: s.statusName, statusCssClass: s.statusCssClass });
    this.drawerOpen = true;
  }

  onAction(e: { action: string; row: Status }): void {
    if (e.action === 'edit')   this.openEdit(e.row);
    if (e.action === 'delete') this.confirmDelete(e.row);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    const obs: Observable<unknown> = this.selected
      ? this.service.update({ ...this.selected, statusName: v.statusName!, statusCssClass: v.statusCssClass! })
      : this.service.add({ statusName: v.statusName!, statusCssClass: v.statusCssClass! });
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.drawerOpen = false;
        this.toast.success(this.selected ? 'Status updated.' : 'Status created.');
        setTimeout(() => this.load());
      },
      error: () => { this.saving = false; this.toast.error('Failed to save.'); }
    });
  }

  confirmDelete(s: Status): void {
    const ref = this.dialog.open(AppConfirmDialogComponent, {
      data: { title: 'Delete Status', message: `Delete "${s.statusName}"?`, danger: true, confirmLabel: 'Delete' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.service.delete(s.statusId).subscribe({
        next: () => { this.toast.success('Status deleted.'); setTimeout(() => this.load()); }
      });
    });
  }
}

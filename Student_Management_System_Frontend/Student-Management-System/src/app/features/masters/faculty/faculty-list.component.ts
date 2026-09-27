import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppTableComponent, TableColumn, TableAction } from '../../../shared/components/app-table/app-table.component';
import { AppDrawerComponent } from '../../../shared/components/app-drawer/app-drawer.component';
import { AppConfirmDialogComponent } from '../../../shared/components/app-confirm-dialog/app-confirm-dialog.component';
import { UserFormComponent } from '../users/user-form.component';
import { UserService } from '../../../core/services/user.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, AppTableComponent, AppDrawerComponent, UserFormComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Manage Faculty</h1>
          <p class="page-subtitle">Faculty members filtered from the user list</p>
        </div>
        <button class="btn btn-primary" (click)="openAdd()">
          <mat-icon>person_add</mat-icon> Add Faculty
        </button>
      </div>
      <app-table [columns]="columns" [data]="displayUsers" [loading]="loading"
                 [actions]="actions" emptyMessage="No faculty found."
                 (actionClicked)="onAction($event)">
      </app-table>
    </div>
    <app-drawer [open]="drawerOpen" [title]="drawerTitle" (closed)="drawerOpen = false">
      <app-user-form [user]="selectedUser" [lockedRoleId]="facultyRoleId"
                     (saved)="onSaved()" (cancelled)="drawerOpen = false">
      </app-user-form>
    </app-drawer>
  `
})
export class FacultyListComponent implements OnInit {
  private service        = inject(UserService);
  private projectService = inject(ProjectService);
  private toast          = inject(ToastService);
  private dialog         = inject(MatDialog);
  private cdr            = inject(ChangeDetectorRef);

  readonly facultyRoleId = 2;
  loading    = true;
  users: User[] = [];
  supervisedCounts: Record<number, number> = {};
  drawerOpen = false;
  selectedUser?: User;
  drawerTitle = 'Add Faculty';

  columns: TableColumn[] = [
    { key: 'avatar',       label: '',               type: 'avatar',  width: '48px' },
    { key: 'fullName',     label: 'Name',            type: 'text',    sortable: true },
    { key: 'email',        label: 'Email',           type: 'text',    sortable: true },
    { key: 'mobileNumber', label: 'Mobile',          type: 'text' },
    { key: '_supervised',  label: 'Supervised',      type: 'text' },
    { key: 'isActive',     label: 'Status',          type: 'badge',   cssClassKey: '_activeCss' },
    { key: '_actions',     label: 'Actions',         type: 'actions', width: '100px' }
  ];
  actions: TableAction[] = [
    { icon: 'edit',   label: 'Edit',   color: 'primary', action: 'edit' },
    { icon: 'delete', label: 'Delete', color: 'danger',  action: 'delete' }
  ];

  get displayUsers(): any[] {
    return this.users.map(u => ({
      ...u,
      avatar:      u.fullName,
      _supervised: this.supervisedCounts[u.userId] ?? 0,
      _activeCss:  u.isActive ? 'badge-success' : 'badge-secondary',
      isActive:    u.isActive ? 'Active' : 'Inactive'
    }));
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({ next: users => {
      this.users = users.filter(u => u.roleName === 'Faculty');
      this.projectService.getAll().subscribe({ next: projects => {
        this.supervisedCounts = {};
        projects.forEach(p => {
          this.supervisedCounts[p.facultyId] = (this.supervisedCounts[p.facultyId] ?? 0) + 1;
        });
        this.loading = false;
        this.cdr.detectChanges();
      }});
    }});
  }

  openAdd(): void  { this.selectedUser = undefined; this.drawerTitle = 'Add Faculty'; this.drawerOpen = true; }
  openEdit(u: User): void { this.selectedUser = u; this.drawerTitle = 'Edit Faculty'; this.drawerOpen = true; }

  onAction(e: { action: string; row: any }): void {
    const real = this.users.find(u => u.userId === e.row.userId);
    if (!real) return;
    if (e.action === 'edit')   this.openEdit(real);
    if (e.action === 'delete') this.confirmDelete(real);
  }

  onSaved(): void { this.drawerOpen = false; this.load(); }

  confirmDelete(user: User): void {
    const ref = this.dialog.open(AppConfirmDialogComponent, {
      data: { title: 'Delete Faculty', message: `Delete "${user.fullName}"?`, danger: true, confirmLabel: 'Delete' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.service.delete(user.userId).subscribe({ next: () => { this.toast.success('Faculty deleted.'); this.load(); } });
    });
  }
}

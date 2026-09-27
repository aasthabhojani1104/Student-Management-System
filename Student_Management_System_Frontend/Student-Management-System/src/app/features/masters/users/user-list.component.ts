import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppTableComponent, TableColumn, TableAction } from '../../../shared/components/app-table/app-table.component';
import { AppDrawerComponent } from '../../../shared/components/app-drawer/app-drawer.component';
import { AppConfirmDialogComponent } from '../../../shared/components/app-confirm-dialog/app-confirm-dialog.component';
import { UserFormComponent } from './user-form.component';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, AppTableComponent, AppDrawerComponent, UserFormComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private service = inject(UserService);
  private toast   = inject(ToastService);
  private dialog  = inject(MatDialog);
  private cdr     = inject(ChangeDetectorRef);

  loading     = true;
  users: User[] = [];
  drawerOpen  = false;
  selectedUser?: User;
  drawerTitle = 'Add User';

  columns: TableColumn[] = [
    { key: 'avatar',        label: '',         type: 'avatar',  width: '48px', imageKey: 'profilePicturePath' },
    { key: 'fullName',      label: 'Name',     type: 'text',    sortable: true },
    { key: 'email',         label: 'Email',    type: 'text',    sortable: true },
    { key: 'mobileNumber',  label: 'Mobile',   type: 'text' },
    { key: 'roleName',      label: 'Role',     type: 'badge',   cssClassKey: '_roleCss' },
    { key: 'isActive',      label: 'Status',   type: 'badge',   cssClassKey: '_activeCss' },
    { key: '_actions',      label: 'Actions',  type: 'actions', width: '100px' }
  ];

  actions: TableAction[] = [
    { icon: 'edit',   label: 'Edit',   color: 'primary', action: 'edit' },
    { icon: 'delete', label: 'Delete', color: 'danger',  action: 'delete' }
  ];

  get displayUsers(): any[] {
    return this.users.map(u => ({
      ...u,
      avatar:             u.fullName,
      profilePicturePath: this.service.getAvatarUrl(u.profilePicturePath),
      _roleCss:   u.roleName === 'Admin'   ? 'badge-primary'
                : u.roleName === 'Faculty' ? 'badge-accent'
                : u.roleName              ? 'badge-success'
                : 'badge-secondary',
      _activeCss: u.isActive ? 'badge-success' : 'badge-secondary',
      isActive:   u.isActive ? 'Active' : 'Inactive'
    }));
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: users => {
        this.users   = [...users];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load users:', err);
        this.toast.error('Failed to load users.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAdd(): void         { this.selectedUser = undefined; this.drawerTitle = 'Add User';  this.drawerOpen = true; }
  openEdit(u: User): void { this.selectedUser = u;         this.drawerTitle = 'Edit User'; this.drawerOpen = true; }

  onAction(e: { action: string; row: any }): void {
    const real = this.users.find(u => u.userId === e.row.userId);
    if (!real) return;
    if (e.action === 'edit')   this.openEdit(real);
    if (e.action === 'delete') this.confirmDelete(real);
  }

  onSaved(): void {
    setTimeout(() => { this.drawerOpen = false; this.load(); });
  }

  confirmDelete(user: User): void {
    const ref = this.dialog.open(AppConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Delete "${user.fullName}"? This cannot be undone.`, danger: true, confirmLabel: 'Delete' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.service.delete(user.userId).subscribe({
          next: ()  => { this.toast.success('User deleted.'); this.load(); },
          error: () => { this.toast.error('Failed to delete user.'); }
        });
      }
    });
  }
}

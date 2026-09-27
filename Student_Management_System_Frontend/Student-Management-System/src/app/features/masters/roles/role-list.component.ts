import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AppTableComponent, TableColumn, TableAction } from '../../../shared/components/app-table/app-table.component';
import { AppDrawerComponent } from '../../../shared/components/app-drawer/app-drawer.component';
import { AppConfirmDialogComponent } from '../../../shared/components/app-confirm-dialog/app-confirm-dialog.component';
import { RoleFormComponent } from './role-form.component';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, AppTableComponent, AppDrawerComponent, RoleFormComponent],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  private service = inject(RoleService);
  private toast   = inject(ToastService);
  private dialog  = inject(MatDialog);
  private cdr     = inject(ChangeDetectorRef);

  loading    = true;
  roles: Role[] = [];
  drawerOpen = false;
  selectedRole?: Role;

  columns: TableColumn[] = [
    { key: 'roleId',      label: '#',           type: 'number',  width: '60px' },
    { key: 'roleName',    label: 'Role Name',   type: 'text',    sortable: true },
    { key: 'description', label: 'Description', type: 'text' },
    { key: '_actions',    label: 'Actions',     type: 'actions', width: '100px' }
  ];

  actions: TableAction[] = [
    { icon: 'edit', label: 'Edit', color: 'primary', action: 'edit' },
    { icon: 'delete', label: 'Delete', color: 'danger', action: 'delete' }
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next:  r   => {
        this.roles   = [...r];   // new array reference forces ngOnChanges on app-table
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load roles:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAdd(): void  { this.selectedRole = undefined; this.drawerOpen = true; }
  openEdit(r: Role): void { this.selectedRole = r; this.drawerOpen = true; }

  onAction(e: { action: string; row: Role }): void {
    if (e.action === 'edit') this.openEdit(e.row);
    if (e.action === 'delete') this.confirmDelete(e.row);
  }

  onSaved(): void {
    // defer close by one tick to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => { this.drawerOpen = false; this.load(); });
  }

  confirmDelete(role: Role): void {
    const ref = this.dialog.open(AppConfirmDialogComponent, {
      data: { title: 'Delete Role', message: `Are you sure you want to delete "${role.roleName}"?`, danger: true, confirmLabel: 'Delete' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.service.delete(role.roleId).subscribe({ next: () => { this.toast.success('Role deleted.'); this.load(); } });
      }
    });
  }
}

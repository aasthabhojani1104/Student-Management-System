import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppTableComponent, TableColumn, TableAction } from '../../shared/components/app-table/app-table.component';
import { AppDrawerComponent } from '../../shared/components/app-drawer/app-drawer.component';
import { AppConfirmDialogComponent } from '../../shared/components/app-confirm-dialog/app-confirm-dialog.component';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { StatusService } from '../../core/services/status.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/models/project.model';
import { User } from '../../core/models/user.model';
import { Status } from '../../core/models/status.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatDialogModule, AppTableComponent, AppDrawerComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private userService    = inject(UserService);
  private statusService  = inject(StatusService);
  private toast          = inject(ToastService);
  private auth           = inject(AuthService);
  private dialog         = inject(MatDialog);
  private fb             = inject(FormBuilder);
  private cdr            = inject(ChangeDetectorRef);

  loading    = true;
  saving     = false;
  projects: Project[] = [];
  students:  User[]   = [];
  faculties: User[]   = [];
  statuses:  Status[] = [];
  drawerOpen      = false;
  detailOpen      = false;
  selectedProject?: Project;
  detailProject?:  Project;
  activeTab = 'overview';

  get isAdmin():   boolean { return this.auth.hasRole('Admin'); }
  get isFaculty(): boolean { return this.auth.hasRole('Faculty'); }
  get isStudent(): boolean { return this.auth.hasRole('Student'); }
  get canEdit():   boolean { return this.isAdmin || this.isFaculty; }

  form = this.fb.group({
    projectTitle: ['', [Validators.required, Validators.maxLength(200)]],
    description:  ['', [Validators.maxLength(1000)]],
    startDate:    ['', [Validators.required]],
    endDate:      ['', [Validators.required]],
    projectStatus:[null as number | null, [Validators.required]],
    facultyId:    [null as number | null, [Validators.required]],
    studentId:    [null as number | null, [Validators.required]]
  });

  columns: TableColumn[] = [
    { key: 'projectTitle', label: 'Project Title',  type: 'text',     sortable: true },
    { key: 'studentName',  label: 'Student',        type: 'text',     sortable: true },
    { key: 'facultyName',  label: 'Faculty',        type: 'text',     sortable: true },
    { key: 'statusName',   label: 'Status',         type: 'badge',    cssClassKey: 'statusCssClass' },
    { key: '_progress',    label: 'Progress',       type: 'progress' },
    { key: 'startDate',    label: 'Start',          type: 'date' },
    { key: 'endDate',      label: 'End',            type: 'date' },
    { key: '_actions',     label: 'Actions',        type: 'actions',  width: '120px' }
  ];

  get actions(): TableAction[] {
    const acts: TableAction[] = [
      { icon: 'visibility', label: 'View',   color: 'accent',  action: 'view' }
    ];
    if (this.canEdit) {
      acts.push({ icon: 'edit',   label: 'Edit',   color: 'primary', action: 'edit' });
      acts.push({ icon: 'delete', label: 'Delete', color: 'danger',  action: 'delete' });
    }
    return acts;
  }

  get displayProjects(): any[] {
    return this.projects.map(p => ({ ...p, _progress: p.progressPercentage }));
  }

  ngOnInit(): void {
    this.projectService.invalidateCache();   // always fresh on page load
    this.loadDropdowns();
    this.load();
  }

  loadDropdowns(): void {
    this.userService.getAll().subscribe({ next: users => {
      this.students  = users.filter(u => u.roleName === 'Student');
      this.faculties = users.filter(u => u.roleName === 'Faculty');
    }});
    this.statusService.getAll().subscribe({ next: s => this.statuses = s });
  }

  load(): void {
    this.loading = true;
    const userId = this.auth.currentUser()?.userId;
    let obs;
    if (this.isFaculty && userId) {
      obs = this.projectService.getByFaculty(userId);
    } else if (this.isStudent && userId) {
      obs = this.projectService.getByStudent(userId);
    } else {
      obs = this.projectService.getAll();
    }
    obs.subscribe({
      next:  p => {
        this.projects = p; this.loading = false; this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Projects error:', err);
        this.loading = false; this.cdr.detectChanges();
        this.toast.error('Failed to load projects.');
      }
    });
  }

  openAdd(): void { this.selectedProject = undefined; this.form.reset(); this.drawerOpen = true; }
  openEdit(p: Project): void {
    this.selectedProject = p;
    this.form.patchValue({
      projectTitle:  p.projectTitle,
      description:   p.description ?? '',
      startDate:     p.startDate,
      endDate:       p.endDate,
      projectStatus: p.projectStatus,
      facultyId:     p.facultyId,
      studentId:     p.studentId
    });
    this.drawerOpen = true;
  }
  openDetail(p: Project): void { this.detailProject = p; this.activeTab = 'overview'; this.detailOpen = true; }

  onAction(e: { action: string; row: any }): void {
    const real = this.projects.find(p => p.projectId === e.row.projectId);
    if (!real) return;
    if (e.action === 'view')   this.openDetail(real);
    if (e.action === 'edit')   this.openEdit(real);
    if (e.action === 'delete') this.confirmDelete(real);
  }

  onSaved(): void { this.drawerOpen = false; this.load(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    const endDate  = new Date(v.endDate!);
    const startDate = new Date(v.startDate!);
    if (endDate <= startDate) {
      this.form.get('endDate')?.setErrors({ afterStart: true });
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }
    const payload: Partial<Project> = {
      projectTitle:  v.projectTitle!,
      description:   v.description || undefined,
      startDate:     v.startDate!,
      endDate:       v.endDate!,
      projectStatus: v.projectStatus!,
      facultyId:     v.facultyId!,
      studentId:     v.studentId!
    };
    const obs: Observable<unknown> = this.selectedProject
      ? this.projectService.update({ ...this.selectedProject, ...payload } as Project)
      : this.projectService.add(payload);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.drawerOpen = false;
        this.toast.success(this.selectedProject ? 'Project updated.' : 'Project created.');
        setTimeout(() => this.load());
      },
      error: () => { this.saving = false; this.toast.error('Failed to save project.'); }
    });
  }

  confirmDelete(p: Project): void {
    const ref = this.dialog.open(AppConfirmDialogComponent, {
      data: { title: 'Delete Project', message: `Delete "${p.projectTitle}"?`, danger: true, confirmLabel: 'Delete' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.projectService.delete(p.projectId).subscribe({
        next: () => { this.toast.success('Project deleted.'); setTimeout(() => this.load()); },
        error: () => { this.toast.error('Failed to delete project.'); }
      });
    });
  }

  getProgressClass(pct: number): string {
    if (pct === 100) return 'success';
    if (pct >= 50)   return '';
    return 'warning';
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}

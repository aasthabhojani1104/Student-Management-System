import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppTableComponent, TableColumn, TableAction } from '../../shared/components/app-table/app-table.component';
import { AppDrawerComponent } from '../../shared/components/app-drawer/app-drawer.component';
import { AppConfirmDialogComponent } from '../../shared/components/app-confirm-dialog/app-confirm-dialog.component';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { StatusService } from '../../core/services/status.service';
import { PriorityService } from '../../core/services/priority.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { Status } from '../../core/models/status.model';
import { Priority } from '../../core/models/priority.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatDialogModule, AppTableComponent, AppDrawerComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  private taskService    = inject(TaskService);
  private projectService = inject(ProjectService);
  private statusService  = inject(StatusService);
  private priorityService = inject(PriorityService);
  private toast          = inject(ToastService);
  private auth           = inject(AuthService);
  private dialog         = inject(MatDialog);
  private fb             = inject(FormBuilder);
  private cdr            = inject(ChangeDetectorRef);

  loading  = true;
  saving   = false;
  tasks: Task[]     = [];
  projects: Project[] = [];
  statuses: Status[]  = [];
  priorities: Priority[] = [];
  drawerOpen    = false;
  selectedTask?: Task;

  get displayTasks(): any[] {
    return this.tasks.map(t => ({
      ...t,
      _score: t.earnedScore != null
        ? `${t.earnedScore} / ${t.assignedScore ?? 0}`
        : `— / ${t.assignedScore ?? 0}`
    }));
  }
  viewOnly      = false;

  get isAdmin():   boolean { return this.auth.hasRole('Admin'); }
  get isFaculty(): boolean { return this.auth.hasRole('Faculty'); }
  get isStudent(): boolean { return this.auth.hasRole('Student'); }
  get canEdit():   boolean { return this.isAdmin || this.isFaculty; }

  form = this.fb.group({
    taskTitle:       ['', [Validators.required, Validators.maxLength(200)]],
    taskDescription: ['', [Validators.maxLength(1000)]],
    projectId:       [null as number | null, [Validators.required]],
    priorityId:      [null as number | null, [Validators.required]],
    taskStatus:      [null as number | null, [Validators.required]],
    startDate:       ['', [Validators.required]],
    dueDate:         ['', [Validators.required]],
    assignedScore:   [null as number | null, [Validators.min(0), Validators.max(100)]],
    earnedScore:     [null as number | null, [Validators.min(0), Validators.max(100)]],
    facultyRemarks:  ['', [Validators.maxLength(500)]],
    studentRemarks:  ['', [Validators.maxLength(500)]]
  });

  columns: TableColumn[] = [
    { key: 'taskTitle',          label: 'Task Title',   type: 'text',     sortable: true },
    { key: 'projectTitle',       label: 'Project',      type: 'text',     sortable: true },
    { key: 'assignedStudentName',label: 'Student',      type: 'text' },
    { key: 'priorityName',       label: 'Priority',     type: 'badge',    cssClassKey: 'priorityCssClass' },
    { key: 'statusName',         label: 'Status',       type: 'badge',    cssClassKey: 'statusCssClass' },
    { key: 'dueDate',            label: 'Due',          type: 'date' },
    { key: 'progressPercentage', label: 'Progress',     type: 'progress' },
    { key: '_score',             label: 'Score',        type: 'text' },
    { key: '_actions',           label: 'Actions',      type: 'actions',  width: '100px' }
  ];

  get actions(): TableAction[] {
    const acts: TableAction[] = [
      { icon: 'visibility', label: 'View', color: 'accent', action: 'view' }
    ];
    if (this.canEdit) {
      acts.push({ icon: 'edit',   label: 'Edit',   color: 'primary', action: 'edit' });
      acts.push({ icon: 'delete', label: 'Delete', color: 'danger',  action: 'delete' });
    }
    return acts;
  }

  ngOnInit(): void {
    this.taskService.invalidateCache();
    this.projectService.invalidateCache();
    this.priorityService.invalidateCache();
    this.loadDropdowns();
    this.load();
  }

  loadDropdowns(): void {
    // Load projects enriched with allocationId — only show ones that have a student allocated
    this.projectService.getAll().subscribe({
      next: p => this.projects = p.filter(pr => pr.allocationId != null),
      error: () => {}
    });
    this.statusService.getAll().subscribe({ next: s => this.statuses = s });
    this.priorityService.getAll().subscribe({ next: p => this.priorities = p });
  }

  load(): void {
    this.loading = true;
    const userId = this.auth.currentUser()?.userId;
    let obs;
    if (this.isStudent && userId) {
      obs = this.taskService.getByStudent(userId);
    } else {
      obs = this.taskService.getAll();
    }
    obs.subscribe({
      next:  t => { this.tasks = t; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); this.toast.error('Failed to load tasks.'); }
    });
  }

  openAdd(): void { this.selectedTask = undefined; this.viewOnly = false; this.form.reset(); this.drawerOpen = true; }
  openEdit(t: Task, view = false): void {
    this.selectedTask = t;
    this.viewOnly = view;
    this.form.patchValue({
      taskTitle:       t.taskTitle,
      taskDescription: t.taskDescription ?? '',
      projectId:       t.projectId,
      priorityId:      t.priorityId,
      taskStatus:      t.taskStatus,
      startDate:       t.startDate ?? '',
      dueDate:         t.dueDate ?? '',
      assignedScore:   t.assignedScore ?? null,
      earnedScore:     t.earnedScore ?? null,
      facultyRemarks:  t.facultyRemarks ?? '',
      studentRemarks:  t.studentRemarks ?? ''
    });
    if (view || this.isStudent) {
      this.form.disable();
      this.form.get('studentRemarks')?.enable();
    } else {
      this.form.enable();
    }
    this.drawerOpen = true;
  }

  onAction(e: { action: string; row: any }): void {
    const real = this.tasks.find(t => t.taskId === e.row.taskId);
    if (!real) return;
    if (e.action === 'view')   this.openEdit(real, true);
    if (e.action === 'edit')   this.openEdit(real, false);
    if (e.action === 'delete') this.confirmDelete(real);
  }

  onSaved(): void { this.drawerOpen = false; this.load(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.getRawValue();
    const due   = new Date(v.dueDate!);
    const start = new Date(v.startDate!);
    if (due <= start) {
      this.form.get('dueDate')?.setErrors({ afterStart: true });
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }
    // projectId form field holds the allocationId value
    const payload: Partial<Task> = {
      taskTitle:       v.taskTitle!,
      taskDescription: v.taskDescription || undefined,
      projectId:       v.projectId!,        // this is actually allocationId
      priorityId:      v.priorityId!,
      taskStatus:      v.taskStatus!,
      startDate:       v.startDate!,
      dueDate:         v.dueDate!,
      assignedScore:   v.assignedScore ?? undefined,
      earnedScore:     v.earnedScore ?? undefined,
      facultyRemarks:  v.facultyRemarks || undefined,
      studentRemarks:  v.studentRemarks || undefined,
      progressPercentage: v.taskStatus === 3 ? 100 : 0
    };
    const obs: Observable<unknown> = this.selectedTask
      ? this.taskService.update({ ...this.selectedTask, ...payload } as Task)
      : this.taskService.add(payload);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.drawerOpen = false;
        // Invalidate project cache so project progress refreshes next time
        this.projectService.invalidateCache();
        this.toast.success(this.selectedTask ? 'Task updated.' : 'Task created.');
        setTimeout(() => this.load());
      },
      error: () => { this.saving = false; this.toast.error('Failed to save task.'); }
    });
  }

  confirmDelete(t: Task): void {
    const ref = this.dialog.open(AppConfirmDialogComponent, {
      data: { title: 'Delete Task', message: `Delete "${t.taskTitle}"?`, danger: true, confirmLabel: 'Delete' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.taskService.delete(t.taskId).subscribe({
        next: () => {
          this.toast.success('Task deleted.');
          this.projectService.invalidateCache();
          setTimeout(() => this.load());
        },
        error: () => { this.toast.error('Failed to delete task.'); }
      });
    });
  }
}

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Auth
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // Shell (authenticated)
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      // Dashboards
      {
        path: 'dashboard/admin',
        loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [roleGuard], data: { roles: ['Admin'], breadcrumb: 'Dashboard' }
      },
      {
        path: 'dashboard/faculty',
        loadComponent: () => import('./features/dashboard/faculty-dashboard/faculty-dashboard.component').then(m => m.FacultyDashboardComponent),
        canActivate: [roleGuard], data: { roles: ['Faculty'], breadcrumb: 'Dashboard' }
      },
      {
        path: 'dashboard/student',
        loadComponent: () => import('./features/dashboard/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
        canActivate: [roleGuard], data: { roles: ['Student'], breadcrumb: 'Dashboard' }
      },

      // Masters
      {
        path: 'masters/roles',
        loadComponent: () => import('./features/masters/roles/role-list.component').then(m => m.RoleListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin'], breadcrumb: 'Roles' }
      },
      {
        path: 'masters/users',
        loadComponent: () => import('./features/masters/users/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin'], breadcrumb: 'Users' }
      },
      {
        path: 'masters/students',
        loadComponent: () => import('./features/masters/students/student-list.component').then(m => m.StudentListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin'], breadcrumb: 'Students' }
      },
      {
        path: 'masters/faculty',
        loadComponent: () => import('./features/masters/faculty/faculty-list.component').then(m => m.FacultyListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin'], breadcrumb: 'Faculty' }
      },
      {
        path: 'masters/status',
        loadComponent: () => import('./features/masters/status/status-list.component').then(m => m.StatusListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin'], breadcrumb: 'Statuses' }
      },
      {
        path: 'masters/priority',
        loadComponent: () => import('./features/masters/priority/priority-list.component').then(m => m.PriorityListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin'], breadcrumb: 'Priorities' }
      },

      // Projects
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list.component').then(m => m.ProjectListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin', 'Faculty', 'Student'], breadcrumb: 'Projects' }
      },

      // Tasks
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/task-list.component').then(m => m.TaskListComponent),
        canActivate: [roleGuard], data: { roles: ['Admin', 'Faculty', 'Student'], breadcrumb: 'Tasks' }
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        data: { breadcrumb: 'Profile' }
      },

      { path: '**', redirectTo: 'auth/login' }
    ]
  },

  { path: '**', redirectTo: 'auth/login' }
];

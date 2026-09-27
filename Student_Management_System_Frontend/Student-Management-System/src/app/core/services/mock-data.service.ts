import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Status } from '../models/status.model';
import { Priority } from '../models/priority.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private DELAY = 0;

  // ─── Roles ────────────────────────────────────────────────
  private roles: Role[] = [
    { roleId: 1, roleName: 'Admin',   description: 'Full system administrator access' },
    { roleId: 2, roleName: 'Faculty', description: 'Supervise and manage student projects' },
    { roleId: 3, roleName: 'Student', description: 'Submit and track project tasks' }
  ];

  // ─── Users ────────────────────────────────────────────────
  private users: User[] = [
    {
      userId: 1, fullName: 'System Administrator', email: 'admin@spms.com',
      password: 'admin123', mobileNumber: '9876543210', isActive: true,
      roleId: 1, roleName: 'Admin'
    },
    {
      userId: 2, fullName: 'Dr. Priya Sharma', email: 'priya.sharma@spms.com',
      password: 'faculty123', mobileNumber: '9876543211', isActive: true,
      roleId: 2, roleName: 'Faculty'
    },
    {
      userId: 3, fullName: 'Prof. Rahul Mehta', email: 'rahul.mehta@spms.com',
      password: 'faculty123', mobileNumber: '9876543212', isActive: true,
      roleId: 2, roleName: 'Faculty'
    },
    {
      userId: 4, fullName: 'Arjun Patel', email: 'arjun.patel@spms.com',
      password: 'student123', mobileNumber: '9876543213', isActive: true,
      roleId: 3, roleName: 'Student'
    },
    {
      userId: 5, fullName: 'Sneha Gupta', email: 'sneha.gupta@spms.com',
      password: 'student123', mobileNumber: '9876543214', isActive: true,
      roleId: 3, roleName: 'Student'
    },
    {
      userId: 6, fullName: 'Vikram Singh', email: 'vikram.singh@spms.com',
      password: 'student123', mobileNumber: '9876543215', isActive: false,
      roleId: 3, roleName: 'Student'
    }
  ];

  // ─── Statuses ─────────────────────────────────────────────
  private statuses: Status[] = [
    { statusId: 1, statusName: 'Not Started', statusCssClass: 'badge-secondary' },
    { statusId: 2, statusName: 'In Progress',  statusCssClass: 'badge-primary'   },
    { statusId: 3, statusName: 'Completed',    statusCssClass: 'badge-success'   },
    { statusId: 4, statusName: 'On Hold',      statusCssClass: 'badge-warning'   }
  ];

  // ─── Priorities ───────────────────────────────────────────
  private priorities: Priority[] = [
    { priorityId: 1, priorityName: 'Low',      priorityCssClass: 'badge-secondary' },
    { priorityId: 2, priorityName: 'Medium',   priorityCssClass: 'badge-info'      },
    { priorityId: 3, priorityName: 'High',     priorityCssClass: 'badge-warning'   },
    { priorityId: 4, priorityName: 'Critical', priorityCssClass: 'badge-danger'    }
  ];

  // ─── Projects ─────────────────────────────────────────────
  private projects: Project[] = [
    {
      projectId: 1,
      projectTitle: 'E-Commerce Platform with AI Recommendations',
      description: 'Build a full-stack e-commerce application with machine-learning-based product recommendations and real-time inventory tracking.',
      studentId: 4, studentName: 'Arjun Patel',
      facultyId: 2, facultyName: 'Dr. Priya Sharma',
      assignedDate: '2025-01-10',
      projectStatus: 2, statusName: 'In Progress', statusCssClass: 'badge-primary',
      startDate: '2025-01-15', endDate: '2025-06-15',
      totalTasks: 8, completedTasks: 5, progressPercentage: 62,
      isDeleted: false
    },
    {
      projectId: 2,
      projectTitle: 'Hospital Management Information System',
      description: 'Develop a comprehensive hospital management system covering patient records, appointments, billing, and pharmacy management.',
      studentId: 5, studentName: 'Sneha Gupta',
      facultyId: 2, facultyName: 'Dr. Priya Sharma',
      assignedDate: '2025-01-12',
      projectStatus: 2, statusName: 'In Progress', statusCssClass: 'badge-primary',
      startDate: '2025-01-20', endDate: '2025-07-20',
      totalTasks: 10, completedTasks: 3, progressPercentage: 30,
      isDeleted: false
    },
    {
      projectId: 3,
      projectTitle: 'Smart Campus IoT Dashboard',
      description: 'IoT-based smart campus monitoring system for energy management, attendance tracking, and environmental sensors.',
      studentId: 6, studentName: 'Vikram Singh',
      facultyId: 3, facultyName: 'Prof. Rahul Mehta',
      assignedDate: '2024-11-01',
      projectStatus: 3, statusName: 'Completed', statusCssClass: 'badge-success',
      startDate: '2024-11-05', endDate: '2025-02-28',
      totalTasks: 6, completedTasks: 6, progressPercentage: 100,
      isDeleted: false
    },
    {
      projectId: 4,
      projectTitle: 'Blockchain-based Document Verification',
      description: 'A decentralised document verification system using Ethereum smart contracts for academic certificate verification.',
      studentId: 4, studentName: 'Arjun Patel',
      facultyId: 3, facultyName: 'Prof. Rahul Mehta',
      assignedDate: '2025-02-01',
      projectStatus: 4, statusName: 'On Hold', statusCssClass: 'badge-warning',
      startDate: '2025-02-10', endDate: '2025-08-10',
      totalTasks: 5, completedTasks: 1, progressPercentage: 20,
      isDeleted: false
    }
  ];

  // ─── Tasks ────────────────────────────────────────────────
  private tasks: Task[] = [
    {
      taskId: 1, projectId: 1, projectTitle: 'E-Commerce Platform with AI Recommendations',
      taskTitle: 'Setup Project Repository & CI/CD Pipeline',
      taskDescription: 'Initialize GitHub repository, configure GitHub Actions for CI/CD, and set up branch protection rules.',
      taskStatus: 3, statusName: 'Completed', statusCssClass: 'badge-success',
      priorityId: 3, priorityName: 'High', priorityCssClass: 'badge-warning',
      assignedScore: 10, earnedScore: 10, progressPercentage: 100,
      startDate: '2025-01-15', dueDate: '2025-01-20', completedDate: '2025-01-19',
      assignedStudentId: 4, assignedStudentName: 'Arjun Patel',
      facultyRemarks: 'Excellent setup with proper branching strategy.',
      isDeleted: false
    },
    {
      taskId: 2, projectId: 1, projectTitle: 'E-Commerce Platform with AI Recommendations',
      taskTitle: 'Design Database Schema & ERD',
      taskDescription: 'Create comprehensive ERD for products, users, orders, cart, and inventory tables.',
      taskStatus: 3, statusName: 'Completed', statusCssClass: 'badge-success',
      priorityId: 3, priorityName: 'High', priorityCssClass: 'badge-warning',
      assignedScore: 15, earnedScore: 14, progressPercentage: 100,
      startDate: '2025-01-20', dueDate: '2025-01-28', completedDate: '2025-01-27',
      assignedStudentId: 4, assignedStudentName: 'Arjun Patel',
      facultyRemarks: 'Good schema design. Minor indexing improvements suggested.',
      isDeleted: false
    },
    {
      taskId: 3, projectId: 1, projectTitle: 'E-Commerce Platform with AI Recommendations',
      taskTitle: 'Build REST APIs for Product Catalogue',
      taskDescription: 'Implement CRUD APIs for products, categories, and inventory using Node.js/Express.',
      taskStatus: 2, statusName: 'In Progress', statusCssClass: 'badge-primary',
      priorityId: 3, priorityName: 'High', priorityCssClass: 'badge-warning',
      assignedScore: 20, earnedScore: undefined, progressPercentage: 70,
      startDate: '2025-02-01', dueDate: '2025-02-20',
      assignedStudentId: 4, assignedStudentName: 'Arjun Patel',
      studentRemarks: 'Working on pagination and filter endpoints.',
      isDeleted: false
    },
    {
      taskId: 4, projectId: 1, projectTitle: 'E-Commerce Platform with AI Recommendations',
      taskTitle: 'Implement ML Recommendation Engine',
      taskDescription: 'Train collaborative filtering model using purchase history data.',
      taskStatus: 1, statusName: 'Not Started', statusCssClass: 'badge-secondary',
      priorityId: 4, priorityName: 'Critical', priorityCssClass: 'badge-danger',
      assignedScore: 25, earnedScore: undefined, progressPercentage: 0,
      startDate: '2025-03-01', dueDate: '2025-04-15',
      assignedStudentId: 4, assignedStudentName: 'Arjun Patel',
      isDeleted: false
    },
    {
      taskId: 5, projectId: 2, projectTitle: 'Hospital Management Information System',
      taskTitle: 'Patient Registration Module',
      taskDescription: 'Build patient onboarding workflow with ID generation, document upload, and medical history.',
      taskStatus: 3, statusName: 'Completed', statusCssClass: 'badge-success',
      priorityId: 4, priorityName: 'Critical', priorityCssClass: 'badge-danger',
      assignedScore: 20, earnedScore: 18, progressPercentage: 100,
      startDate: '2025-01-20', dueDate: '2025-02-05', completedDate: '2025-02-04',
      assignedStudentId: 5, assignedStudentName: 'Sneha Gupta',
      facultyRemarks: 'Module works well. Add input validation for edge cases.',
      isDeleted: false
    },
    {
      taskId: 6, projectId: 2, projectTitle: 'Hospital Management Information System',
      taskTitle: 'Appointment Scheduling System',
      taskDescription: 'Calendar-based appointment booking with doctor availability, reminders, and conflict detection.',
      taskStatus: 2, statusName: 'In Progress', statusCssClass: 'badge-primary',
      priorityId: 3, priorityName: 'High', priorityCssClass: 'badge-warning',
      assignedScore: 20, earnedScore: undefined, progressPercentage: 50,
      startDate: '2025-02-06', dueDate: '2025-03-10',
      assignedStudentId: 5, assignedStudentName: 'Sneha Gupta',
      studentRemarks: 'Calendar UI is done. Working on conflict detection logic.',
      isDeleted: false
    },
    {
      taskId: 7, projectId: 3, projectTitle: 'Smart Campus IoT Dashboard',
      taskTitle: 'Sensor Data Ingestion Pipeline',
      taskDescription: 'MQTT broker setup and data ingestion pipeline using Node-RED.',
      taskStatus: 3, statusName: 'Completed', statusCssClass: 'badge-success',
      priorityId: 4, priorityName: 'Critical', priorityCssClass: 'badge-danger',
      assignedScore: 30, earnedScore: 29, progressPercentage: 100,
      startDate: '2024-11-05', dueDate: '2024-11-25', completedDate: '2024-11-24',
      assignedStudentId: 6, assignedStudentName: 'Vikram Singh',
      facultyRemarks: 'Outstanding work on the ingestion pipeline.',
      isDeleted: false
    },
    {
      taskId: 8, projectId: 4, projectTitle: 'Blockchain-based Document Verification',
      taskTitle: 'Smart Contract Development',
      taskDescription: 'Write and test Solidity smart contracts for certificate issuance and verification.',
      taskStatus: 4, statusName: 'On Hold', statusCssClass: 'badge-warning',
      priorityId: 4, priorityName: 'Critical', priorityCssClass: 'badge-danger',
      assignedScore: 35, earnedScore: undefined, progressPercentage: 15,
      startDate: '2025-02-10', dueDate: '2025-03-20',
      assignedStudentId: 4, assignedStudentName: 'Arjun Patel',
      studentRemarks: 'Paused pending Ethereum testnet access approval.',
      isDeleted: false
    }
  ];

  // ─── ID counters ──────────────────────────────────────────
  private nextRoleId    = 4;
  private nextUserId    = 7;
  private nextStatusId  = 5;
  private nextPriorityId = 5;
  private nextProjectId = 5;
  private nextTaskId    = 9;

  // ─── Helpers ──────────────────────────────────────────────
  private clone<T>(arr: T[]): T[] {
    return arr.map(item => ({ ...item }));
  }

  private enrichProjects(projects: Project[]): Project[] {
    return projects.map(p => {
      const status = this.statuses.find(s => s.statusId === p.projectStatus);
      const student = this.users.find(u => u.userId === p.studentId);
      const faculty  = this.users.find(u => u.userId === p.facultyId);
      const projectTasks = this.tasks.filter(t => t.projectId === p.projectId && !t.isDeleted);
      const completed = projectTasks.filter(t => t.taskStatus === 3).length;
      const total = projectTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...p,
        statusName: status?.statusName,
        statusCssClass: status?.statusCssClass,
        studentName: student?.fullName,
        facultyName: faculty?.fullName,
        totalTasks: total,
        completedTasks: completed,
        progressPercentage: progress
      };
    });
  }

  private enrichTasks(tasks: Task[]): Task[] {
    return tasks.map(t => {
      const status   = this.statuses.find(s => s.statusId === t.taskStatus);
      const priority = this.priorities.find(p => p.priorityId === t.priorityId);
      const project  = this.projects.find(p => p.projectId === t.projectId);
      const student  = t.assignedStudentId ? this.users.find(u => u.userId === t.assignedStudentId) : undefined;
      return {
        ...t,
        statusName: status?.statusName,
        statusCssClass: status?.statusCssClass,
        priorityName: priority?.priorityName,
        priorityCssClass: priority?.priorityCssClass,
        projectTitle: project?.projectTitle,
        assignedStudentName: student?.fullName
      };
    });
  }

  // ─── Role CRUD ────────────────────────────────────────────
  getRoles(): Observable<Role[]> {
    return of(this.clone(this.roles));
  }

  addRole(role: Partial<Role>): Observable<Role> {
    const newRole: Role = { roleId: this.nextRoleId++, roleName: role.roleName!, description: role.description };
    this.roles.push(newRole);
    return of({ ...newRole });
  }

  updateRole(role: Role): Observable<Role> {
    const idx = this.roles.findIndex(r => r.roleId === role.roleId);
    if (idx === -1) return throwError(() => new Error('Role not found'));
    this.roles[idx] = { ...role };
    return of({ ...this.roles[idx] });
  }

  deleteRole(id: number): Observable<void> {
    this.roles = this.roles.filter(r => r.roleId !== id);
    return of(undefined);
  }

  // ─── User CRUD ────────────────────────────────────────────
  getUsers(): Observable<User[]> {
    return of(this.clone(this.users.filter(u => !u.isDeleted)));
  }

  getUserById(id: number): Observable<User | undefined> {
    const user = this.users.find(u => u.userId === id && !u.isDeleted);
    return of(user ? { ...user } : undefined);
  }

  addUser(user: Partial<User>): Observable<User> {
    const role = this.roles.find(r => r.roleId === user.roleId);
    const newUser: User = {
      userId: this.nextUserId++,
      fullName: user.fullName!,
      email: user.email!,
      password: user.password,
      mobileNumber: user.mobileNumber,
      isActive: user.isActive ?? true,
      roleId: user.roleId!,
      roleName: role?.roleName,
      isDeleted: false
    };
    this.users.push(newUser);
    return of({ ...newUser });
  }

  updateUser(user: User): Observable<User> {
    const idx = this.users.findIndex(u => u.userId === user.userId);
    if (idx === -1) return throwError(() => new Error('User not found'));
    const role = this.roles.find(r => r.roleId === user.roleId);
    this.users[idx] = { ...user, roleName: role?.roleName };
    return of({ ...this.users[idx] });
  }

  deleteUser(id: number): Observable<void> {
    const idx = this.users.findIndex(u => u.userId === id);
    if (idx !== -1) this.users[idx].isDeleted = true;
    return of(undefined);
  }

  // ─── Status CRUD ──────────────────────────────────────────
  getStatuses(): Observable<Status[]> {
    return of(this.clone(this.statuses));
  }

  addStatus(s: Partial<Status>): Observable<Status> {
    const newStatus: Status = { statusId: this.nextStatusId++, statusName: s.statusName!, statusCssClass: s.statusCssClass! };
    this.statuses.push(newStatus);
    return of({ ...newStatus });
  }

  updateStatus(s: Status): Observable<Status> {
    const idx = this.statuses.findIndex(st => st.statusId === s.statusId);
    if (idx === -1) return throwError(() => new Error('Status not found'));
    this.statuses[idx] = { ...s };
    return of({ ...this.statuses[idx] });
  }

  deleteStatus(id: number): Observable<void> {
    this.statuses = this.statuses.filter(s => s.statusId !== id);
    return of(undefined);
  }

  // ─── Priority CRUD ────────────────────────────────────────
  getPriorities(): Observable<Priority[]> {
    return of(this.clone(this.priorities));
  }

  addPriority(p: Partial<Priority>): Observable<Priority> {
    const newPriority: Priority = { priorityId: this.nextPriorityId++, priorityName: p.priorityName!, priorityCssClass: p.priorityCssClass! };
    this.priorities.push(newPriority);
    return of({ ...newPriority });
  }

  updatePriority(p: Priority): Observable<Priority> {
    const idx = this.priorities.findIndex(pr => pr.priorityId === p.priorityId);
    if (idx === -1) return throwError(() => new Error('Priority not found'));
    this.priorities[idx] = { ...p };
    return of({ ...this.priorities[idx] });
  }

  deletePriority(id: number): Observable<void> {
    this.priorities = this.priorities.filter(p => p.priorityId !== id);
    return of(undefined);
  }

  // ─── Project CRUD ─────────────────────────────────────────
  getProjects(): Observable<Project[]> {
    return of(this.enrichProjects(this.projects.filter(p => !p.isDeleted)));
  }

  getProjectById(id: number): Observable<Project | undefined> {
    const project = this.projects.find(p => p.projectId === id && !p.isDeleted);
    if (!project) return of(undefined);
    return of(this.enrichProjects([project])[0]);
  }

  getProjectsByFacultyId(facultyId: number): Observable<Project[]> {
    const filtered = this.projects.filter(p => p.facultyId === facultyId && !p.isDeleted);
    return of(this.enrichProjects(filtered));
  }

  getProjectsByStudentId(studentId: number): Observable<Project[]> {
    const filtered = this.projects.filter(p => p.studentId === studentId && !p.isDeleted);
    return of(this.enrichProjects(filtered));
  }

  addProject(p: Partial<Project>): Observable<Project> {
    const status   = this.statuses.find(s => s.statusId === p.projectStatus);
    const student  = this.users.find(u => u.userId === p.studentId);
    const faculty  = this.users.find(u => u.userId === p.facultyId);
    const newProject: Project = {
      projectId: this.nextProjectId++,
      projectTitle: p.projectTitle!,
      description: p.description,
      studentId: p.studentId!,
      studentName: student?.fullName,
      facultyId: p.facultyId!,
      facultyName: faculty?.fullName,
      assignedDate: new Date().toISOString().split('T')[0],
      projectStatus: p.projectStatus!,
      statusName: status?.statusName,
      statusCssClass: status?.statusCssClass,
      startDate: p.startDate!,
      endDate: p.endDate!,
      totalTasks: 0, completedTasks: 0, progressPercentage: 0,
      isDeleted: false
    };
    this.projects.push(newProject);
    return of({ ...newProject });
  }

  updateProject(p: Project): Observable<Project> {
    const idx = this.projects.findIndex(pr => pr.projectId === p.projectId);
    if (idx === -1) return throwError(() => new Error('Project not found'));
    const status  = this.statuses.find(s => s.statusId === p.projectStatus);
    const student = this.users.find(u => u.userId === p.studentId);
    const faculty = this.users.find(u => u.userId === p.facultyId);
    this.projects[idx] = {
      ...p,
      statusName: status?.statusName,
      statusCssClass: status?.statusCssClass,
      studentName: student?.fullName,
      facultyName: faculty?.fullName
    };
    return of({ ...this.projects[idx] });
  }

  deleteProject(id: number): Observable<void> {
    const idx = this.projects.findIndex(p => p.projectId === id);
    if (idx !== -1) this.projects[idx].isDeleted = true;
    return of(undefined);
  }

  // ─── Task CRUD ────────────────────────────────────────────
  getTasks(): Observable<Task[]> {
    return of(this.enrichTasks(this.tasks.filter(t => !t.isDeleted)));
  }

  getTasksByProjectId(projectId: number): Observable<Task[]> {
    const filtered = this.tasks.filter(t => t.projectId === projectId && !t.isDeleted);
    return of(this.enrichTasks(filtered));
  }

  getTasksByStudentId(studentId: number): Observable<Task[]> {
    const filtered = this.tasks.filter(t => t.assignedStudentId === studentId && !t.isDeleted);
    return of(this.enrichTasks(filtered));
  }

  addTask(t: Partial<Task>): Observable<Task> {
    const status   = this.statuses.find(s => s.statusId === t.taskStatus);
    const priority = this.priorities.find(p => p.priorityId === t.priorityId);
    const project  = this.projects.find(p => p.projectId === t.projectId);
    const student  = t.assignedStudentId ? this.users.find(u => u.userId === t.assignedStudentId) : undefined;
    const newTask: Task = {
      taskId: this.nextTaskId++,
      projectId: t.projectId!,
      projectTitle: project?.projectTitle,
      taskTitle: t.taskTitle!,
      taskDescription: t.taskDescription,
      taskStatus: t.taskStatus!,
      statusName: status?.statusName,
      statusCssClass: status?.statusCssClass,
      priorityId: t.priorityId!,
      priorityName: priority?.priorityName,
      priorityCssClass: priority?.priorityCssClass,
      progressPercentage: t.progressPercentage ?? 0,
      assignedScore: t.assignedScore,
      earnedScore: t.earnedScore,
      startDate: t.startDate,
      dueDate: t.dueDate,
      assignedStudentId: t.assignedStudentId,
      assignedStudentName: student?.fullName,
      facultyRemarks: t.facultyRemarks,
      studentRemarks: t.studentRemarks,
      isDeleted: false
    };
    this.tasks.push(newTask);
    return of({ ...newTask });
  }

  updateTask(t: Task): Observable<Task> {
    const idx = this.tasks.findIndex(tk => tk.taskId === t.taskId);
    if (idx === -1) return throwError(() => new Error('Task not found'));
    const status   = this.statuses.find(s => s.statusId === t.taskStatus);
    const priority = this.priorities.find(p => p.priorityId === t.priorityId);
    const project  = this.projects.find(p => p.projectId === t.projectId);
    const student  = t.assignedStudentId ? this.users.find(u => u.userId === t.assignedStudentId) : undefined;
    this.tasks[idx] = {
      ...t,
      statusName: status?.statusName,
      statusCssClass: status?.statusCssClass,
      priorityName: priority?.priorityName,
      priorityCssClass: priority?.priorityCssClass,
      projectTitle: project?.projectTitle,
      assignedStudentName: student?.fullName
    };
    return of({ ...this.tasks[idx] });
  }

  deleteTask(id: number): Observable<void> {
    const idx = this.tasks.findIndex(t => t.taskId === id);
    if (idx !== -1) this.tasks[idx].isDeleted = true;
    return of(undefined);
  }

  // ─── Validate credentials ─────────────────────────────────
  validateCredentials(email: string, password: string): User | null {
    return this.users.find(u => u.email === email && u.password === password && u.isActive && !u.isDeleted) ?? null;
  }
}

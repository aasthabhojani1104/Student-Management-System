# Student Project Management System (SPMS)
### Full Technical Documentation

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Backend — API Reference](#5-backend--api-reference)
6. [FluentValidation Rules](#6-fluentvalidation-rules)
7. [JWT Authentication & Authorization](#7-jwt-authentication--authorization)
8. [Frontend — Module Guide](#8-frontend--module-guide)
9. [Role-Based Access Control](#9-role-based-access-control)
10. [File & Folder Structure](#10-file--folder-structure)
11. [Setup & Run Guide](#11-setup--run-guide)
12. [Known Limitations & Future Work](#12-known-limitations--future-work)

---

## 1. Project Overview

SPMS is a full-stack academic project lifecycle management system. It allows institutions to manage students, faculty, projects, task assignments, scoring, and progress tracking — all behind role-based access control.

### Core Features
| Feature | Description |
|---|---|
| Role-based login | Admin, Faculty, Student each get a scoped dashboard |
| User management | Create, edit, soft-delete users with avatar upload |
| Project management | Faculty-supervised projects assigned to students |
| Task management | Per-allocation tasks with scoring, progress, and remarks |
| Dynamic statuses | Statuses and priorities driven from DB — no hardcoded values |
| Real-time progress | Task completion auto-recalculates parent project progress |
| JWT security | 8-hour token, BCrypt passwords, auto-logout on expiry |
| FluentValidation | All input validated server-side with consistent error responses |

---

## 2. Technology Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| .NET | 10.0 | Runtime |
| ASP.NET Core Web API | 10.0 | HTTP framework |
| Entity Framework Core | 10.0.10 | ORM |
| EF Core SQL Server | 10.0.10 | DB provider |
| AutoMapper | 12.0.1 | DTO ↔ Model mapping |
| BCrypt.Net-Next | 4.2.0 | Password hashing |
| FluentValidation.AspNetCore | 11.3.0 | Input validation |
| FluentValidation.DependencyInjectionExtensions | 11.5.1 | Auto DI registration |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.12 | JWT auth |
| Scalar.AspNetCore | 2.16.17 | API documentation UI |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Angular | 19+ | SPA framework |
| Angular Material | Latest | UI component library |
| ng2-charts + Chart.js | Latest | Dashboard charts |
| RxJS | Latest | Reactive data streams |

### Database
- **SQL Server Express** — `StudentManagementSystemDb`
- Windows Authentication (`Trusted_Connection=True`)

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Frontend                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Admin   │  │ Faculty  │  │ Student  │  Dashboards  │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Core Services (HTTP + Cache)               │ │
│  │  AuthService │ UserService │ ProjectService        │ │
│  │  TaskService │ StatusService │ PriorityService     │ │
│  └─────────────────────┬──────────────────────────────┘ │
│                         │  JWT Bearer token              │
│               authInterceptor (401 → auto-logout)        │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────┐
│               ASP.NET Core Web API                       │
│  FluentValidation → Controllers → Services → EF Core    │
│                                                          │
│  Auth/UserController  │  Admin/*Controller               │
│  Faculty/*Controller  │  Student/*Controller             │
└──────────────────────────────────────────────────────────┘
                          │
             ┌────────────▼────────────┐
             │   SQL Server Express    │
             │  StudentManagementSystemDb │
             └─────────────────────────┘
```

### Middleware Pipeline (in order)
```
UseCors → UseHttpsRedirection → UseStaticFiles →
UseAuthentication → UseAuthorization → MapControllers
```

---

## 4. Database Schema

### Tables & Key Columns

#### `Users`
| Column | Type | Notes |
|---|---|---|
| UserId | int PK | Auto-increment |
| FullName | nvarchar(150) | Required |
| Email | nvarchar(150) | Unique index |
| Password | nvarchar(100) | BCrypt hash |
| MobileNumber | nvarchar(15) | Required |
| ProfilePicturePath | nvarchar(500) | Relative URL e.g. `/uploads/avatars/1.jpg` |
| IsActive | bit | Default true |
| IsDeleted | bit | Soft-delete flag |
| CreatedAt | datetime | Auto-set by EF SaveChanges override |
| UpdatedAt | datetime | Auto-set by EF SaveChanges override |

#### `Roles`
| Column | Type | Notes |
|---|---|---|
| RoleId | int PK | |
| RoleName | nvarchar(50) | Unique index |
| Description | nvarchar(200) | Nullable |

**Seeded roles:** `Admin (2)`, `Student (9)`, `Faculty (10)`

#### `UserRoles`
| Column | Type | Notes |
|---|---|---|
| RolePermissionId | int PK | |
| UserId | int FK→Users | Restrict delete |
| RoleId | int FK→Roles | Restrict delete |

#### `Statuses`
| Column | Type | Notes |
|---|---|---|
| StatusID | int PK | |
| StatusName | nvarchar(20) | Unique index |
| StatusCssClass | nvarchar(100) | e.g. `bg-success` |

**Seeded:** Not Started, In Progress, Completed, On Hold, Active, Inactive

#### `Priorities`
| Column | Type | Notes |
|---|---|---|
| PriorityID | int PK | |
| PriorityName | nvarchar(20) | Unique index |
| PriorityCssClass | nvarchar(20) | e.g. `bg-danger` |

**Seeded:** Low, Medium, High, Critical

#### `Projects`
| Column | Type | Notes |
|---|---|---|
| ProjectId | int PK | |
| ProjectTitle | nvarchar(200) | Required |
| FacultyId | int FK→Users | Restrict |
| ProjectStatus | int FK→Statuses | Restrict |
| StartDate / EndDate | datetime | Required |
| TotalTasks | int | Auto-updated by TaskService |
| CompletedTasks | int | Auto-updated by TaskService |
| ProgressPercentage | decimal(5,2) | Auto-calculated |

#### `ProjectAllocations`
| Column | Type | Notes |
|---|---|---|
| AllocationID | int PK | |
| ProjectId | int FK→Projects | Restrict |
| StudentId | int FK→Users | Restrict |
| AssignedDate | datetime | Default GETDATE() |

Unique composite index on `(ProjectId, StudentId)`.

#### `Tasks`
| Column | Type | Notes |
|---|---|---|
| TaskId | int PK | |
| AllocationID | int FK→ProjectAllocations | Restrict |
| TaskTitle | nvarchar(200) | Required |
| TaskStatus | int FK→Statuses | Restrict |
| PriorityID | int FK→Priorities | Restrict |
| AssignedScore | decimal(5,2) | 0–100 |
| EarnedScore | decimal(5,2) | ≤ AssignedScore |
| ProgressPercentage | decimal(5,2) | Auto-set by TaskService based on status name |
| StartDate / DueDate | datetime? | Optional |
| FacultyRemarks / StudentRemarks | nvarchar(500) | Optional |

---

## 5. Backend — API Reference

### Authentication (public)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/login` | None | Login — returns JWT token |

**Request:**
```json
{ "email": "admin@spms.com", "password": "Admin@123" }
```
**Response:**
```json
{
  "token": "eyJ...",
  "userId": 1,
  "fullName": "Admin User",
  "email": "admin@spms.com",
  "role": "Admin"
}
```

---

### Users (`/api/users`)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all active users (with role info) |
| GET | `/api/users/{id}` | Admin, Faculty, Student | Get user by ID |
| POST | `/api/users` | Admin | Create user — BCrypt hashes password |
| PUT | `/api/users/{id}` | Admin | Update user |
| DELETE | `/api/users/{id}` | Admin | Soft-delete user |
| POST | `/api/users/{id}/avatar` | Admin, Faculty, Student | Upload profile picture (own ID only for non-Admin) |

---

### Roles (`/api/roles` and `/api/admin/roles`)
| Method | Endpoint | Role |
|---|---|---|
| GET/POST | `/api/roles` | Admin |
| PUT/DELETE | `/api/roles/{id}` | Admin |

---

### Statuses (`/api/status`)
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/status` | Returns all statuses |
| POST | `/api/status` | 409 Conflict if duplicate name |
| PUT | `/api/status/{id}` | 404 if not found |
| DELETE | `/api/status/{id}` | Hard delete |

---

### Priorities (`/api/admin/priorities`)
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/admin/priorities` | Returns all priorities |
| POST | `/api/admin/priorities` | 409 Conflict if duplicate name |
| PUT/DELETE | `/api/admin/priorities/{id}` | |

---

### Projects
| Endpoint | Role | Description |
|---|---|---|
| GET `/api/admin/projects` | Admin | All projects enriched with student info |
| GET `/api/faculty/projects` | Faculty | Own projects only |
| GET `/api/student/projects` | Student | Allocated projects only |
| POST `/api/admin/projects` | Admin | Create + auto-create allocation |
| POST `/api/faculty/projects` | Faculty | Create (own facultyId) |
| PUT `/api/admin/projects/{id}` | Admin | Update + upsert allocation |
| DELETE `/api/admin/projects/{id}` | Admin | Soft-delete → cascades to allocations + tasks |

---

### Tasks
| Endpoint | Role | Description |
|---|---|---|
| GET `/api/admin/tasks` | Admin | All tasks |
| GET `/api/faculty/tasks` | Faculty | Tasks for faculty's projects |
| GET `/api/student/tasks` | Student | Own tasks only |
| POST `/api/admin/tasks` or `/api/faculty/tasks` | Admin, Faculty | Create task — auto-sets progress by status |
| PUT `/api/admin/tasks/{id}` | Admin, Faculty | Update + recalcs project progress |
| PATCH `/api/student/tasks/{id}/remarks` | Student | Student remarks only |
| DELETE `/api/admin/tasks/{id}` | Admin, Faculty | Soft-delete + recalcs project progress |

---

### Allocations (`/api/admin/allocations`)
| Endpoint | Description |
|---|---|
| GET `/api/admin/allocations` | All allocations |
| GET `/api/admin/allocations/project/{id}` | By project |
| POST `/api/admin/allocations` | Allocate student (409 on duplicate) |
| DELETE `/api/admin/allocations/{id}` | Soft-delete allocation |

---

### Dashboards
| Endpoint | Role | Returns |
|---|---|---|
| GET `/api/admin/dashboard/stats` | Admin | KPIs + chart distributions + recent projects & tasks |
| GET `/api/faculty/dashboard/stats` | Faculty | KPIs + project progress chart + upcoming deadlines |
| GET `/api/student/dashboard/stats` | Student | KPIs + my projects + upcoming deadlines |

---

### Error Response Format (FluentValidation)
```json
{
  "message": "Validation failed.",
  "errors": [
    { "field": "Email",    "message": "Email is required." },
    { "field": "Password", "message": "Password must be at least 8 characters." }
  ]
}
```

---

## 6. FluentValidation Rules

### `LoginValidator`
| Field | Rules |
|---|---|
| Email | Required · Valid email · Max 150 |
| Password | Required · Min 4 |

### `UserValidator`
| Field | Rules |
|---|---|
| FullName | Required · Max 150 · Letters & spaces only |
| Email | Required · Valid email · Max 150 |
| Password (create, UserId=0) | Required · Min 8 · Max 255 · Uppercase + lowercase + digit |
| Password (update, UserId>0) | Optional — if provided: same strength rules |
| MobileNumber | Required · 7–15 digits |
| ProfilePicturePath | Max 500 (when provided) |
| RoleId | > 0 (when provided) |

### `RoleValidator`
| Field | Rules |
|---|---|
| RoleName | Required · Max 50 · Letters & spaces only |
| Description | Max 200 (when provided) |

### `StatusValidator`
| Field | Rules |
|---|---|
| StatusName | Required · Max 20 · Letters & spaces only |
| StatusCssClass | Required · Must be one of: `bg-success`, `bg-warning`, `bg-danger`, `bg-primary`, `bg-secondary`, `bg-dark`, `bg-info`, `bg-light` |

### `PriorityValidator`
| Field | Rules |
|---|---|
| PriorityName | Required · Max 20 · Letters & spaces only |
| PriorityCssClass | Required · Must be one of allowed `bg-*` values |

### `ProjectValidator`
| Field | Rules |
|---|---|
| ProjectTitle | Required · Max 200 |
| Description | Max 2000 (when provided) |
| FacultyId | > 0 |
| ProjectStatus | > 0 |
| StartDate | Required · Must be before EndDate |
| EndDate | Required · Must be after StartDate |

### `TaskValidator`
| Field | Rules |
|---|---|
| AllocationId | > 0 |
| TaskTitle | Required · Max 200 |
| TaskStatus | > 0 |
| PriorityId | > 0 |
| AssignedScore | 0–100 |
| EarnedScore | 0 to ≤ AssignedScore (when provided) |
| StartDate/DueDate | StartDate < DueDate (when both provided) |
| FacultyRemarks / StudentRemarks | Max 500 (when provided) |

### `ProjectAllocationValidator`
| Field | Rules |
|---|---|
| ProjectId | > 0 |
| StudentId | > 0 |

### `UserRoleValidator`
| Field | Rules |
|---|---|
| UserId | > 0 |
| RoleId | > 0 |

---

## 7. JWT Authentication & Authorization

### Token Configuration
```json
{
  "Jwt": {
    "Key": "ya6rxLu8fUSqG3JcfiBhQW8QsSJnyZijpvBgTYHV2RN",
    "Issuer": "StudentManagementSystem",
    "Audience": "StudentManagementSystemUsers",
    "ExpiresInMinutes": 480
  }
}
```

### JWT Claims
| Claim | Value |
|---|---|
| `NameIdentifier` | UserId |
| `Email` | User email |
| `Name` | Full name |
| `Role` | Admin / Faculty / Student |
| `Jti` | Unique GUID per token |

### Password Security
- Stored as BCrypt hashes (`$2a$11$...`)
- Plain-text passwords auto-upgrade to BCrypt on first login
- Strength: uppercase + lowercase + digit + min 8 chars

### Frontend Auto-Logout
`authInterceptor` catches every `401` response (except `/users/login`) → calls `auth.logout()` → clears storage → navigates to `/auth/login`.

---

## 8. Frontend — Module Guide

### Route Map
| Path | Component | Roles |
|---|---|---|
| `/auth/login` | LoginComponent | Public |
| `/dashboard/admin` | AdminDashboardComponent | Admin |
| `/dashboard/faculty` | FacultyDashboardComponent | Faculty |
| `/dashboard/student` | StudentDashboardComponent | Student |
| `/masters/roles` | RoleListComponent | Admin |
| `/masters/users` | UserListComponent | Admin |
| `/masters/students` | StudentListComponent | Admin |
| `/masters/faculty` | FacultyListComponent | Admin |
| `/masters/status` | StatusListComponent | Admin |
| `/masters/priority` | PriorityListComponent | Admin |
| `/projects` | ProjectListComponent | Admin, Faculty, Student |
| `/tasks` | TaskListComponent | Admin, Faculty, Student |
| `/profile` | ProfileComponent | All authenticated |

### Core Services
| Service | API Base | Caching |
|---|---|---|
| `AuthService` | `/api/users/login` | Signal-based session |
| `UserService` | `/api/users` | `shareReplay` + invalidate on write |
| `RoleService` | `/api/roles` | `shareReplay` + invalidate on write |
| `StatusService` | `/api/status` | `shareReplay` + invalidate on write |
| `PriorityService` | `/api/admin/priorities` | `shareReplay` + invalidate on write |
| `ProjectService` | Role-aware URL | `shareReplay` + invalidate on write |
| `TaskService` | Role-aware URL | `shareReplay` + invalidate on write |

### CSS Class Mapping (in all services)
| DB Value | Display Class |
|---|---|
| `bg-success` | `badge-success` (green) |
| `bg-warning` | `badge-warning` (yellow) |
| `bg-danger` | `badge-danger` (red) |
| `bg-primary` | `badge-primary` (blue) |
| `bg-secondary` | `badge-secondary` (grey) |
| `bg-dark` | `badge-secondary` |

---

## 9. Role-Based Access Control

### Permissions Matrix
| Feature | Admin | Faculty | Student |
|---|---|---|---|
| Admin Dashboard | ✅ | ❌ | ❌ |
| Faculty Dashboard | ❌ | ✅ | ❌ |
| Student Dashboard | ❌ | ❌ | ✅ |
| Manage Roles | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Students/Faculty lists | ✅ | ❌ | ❌ |
| Status/Priority | ✅ | ❌ | ❌ |
| Projects — all | ✅ | Own only | Own only |
| Tasks — all | ✅ | Own only | Own only |
| Create/Edit Tasks | ✅ | ✅ | ❌ |
| Student Remarks | ✅ | ✅ | ✅ (own only) |
| Profile | ✅ | ✅ | ✅ |
| Avatar Upload | ✅ (any) | ✅ (own) | ✅ (own) |

### Guard Chain (Frontend)
```
Route → authGuard (logged in?) → roleGuard (correct role?) → Component
```

### Backend Enforcement
Every controller method has `[Authorize(Roles = "...")]`. Faculty/Student controllers extract `userId` from JWT claims — users cannot access other users' data.

---

## 10. File & Folder Structure

```
Student_Management_System_backend/
├── Controllers/
│   ├── Auth/UserController.cs           # Login + User CRUD + Avatar
│   ├── Admin/  (Dashboard, Role, Status, User, UserRole,
│   │            Priority, Project, ProjectAllocation, Task)
│   ├── Faculty/ (Dashboard, Profile, Project, Student, Task)
│   ├── Student/ (Dashboard, Profile, Project, Task)
│   ├── RoleController.cs
│   ├── StatusController.cs
│   └── UserRollController.cs
├── DTO/                                 # Clean DTOs — no DataAnnotations
│   └── (LoginDto, RoleDto, StatusDto, PriorityDto, UserDto,
│         UserRoleDto, ProjectDto, ProjectAllocationDto, TaskDto)
├── Validators/                          # FluentValidation
│   └── (LoginValidator, RoleValidator, StatusValidator,
│         PriorityValidator, UserValidator, UserRoleValidator,
│         ProjectValidator, ProjectAllocationValidator, TaskValidator)
├── Services/
│   ├── Interface/   (IRoleService, IStatusService, IUserService,
│   │                 IUserRoleService, IPriorityService, IProjectService,
│   │                 IProjectAllocationService, ITaskService)
│   └── Implementation/
├── Model/           (BaseEntity, RoleModel, UserModel, UserRoleModel,
│                     StatusModel, PriorityModel, ProjectModel,
│                     ProjectAllocationModel, TaskModel)
├── Mapping/MappingProfile.cs
├── Data/AppDbContext.cs
├── Migrations/
├── wwwroot/uploads/avatars/
├── appsettings.json
└── Program.cs

Student-Management-System/src/app/
├── core/
│   ├── guards/         (auth.guard.ts, role.guard.ts)
│   ├── interceptors/   (auth.interceptor.ts)
│   ├── models/         (user, project, task, status, priority)
│   └── services/       (auth, user, role, status, priority,
│                         project, task, toast, theme)
├── features/
│   ├── auth/login/
│   ├── dashboard/      (admin, faculty, student)
│   ├── masters/        (roles, users, students, faculty, status, priority)
│   ├── projects/
│   ├── tasks/
│   └── profile/
├── layout/             (shell, sidebar, topnav, breadcrumb)
├── shared/components/  (app-table, app-drawer, app-badge, app-skeleton,
│                        app-toast, app-confirm-dialog, kpi-card)
└── app.routes.ts
```

---

## 11. Setup & Run Guide

### Prerequisites
- .NET 10 SDK
- Node.js 18+, Angular CLI 19+
- SQL Server Express
- SQL Server Management Studio

### Backend Setup
```bash
cd Student_Management_System_backend
dotnet restore
dotnet run
# API → https://localhost:7029
# Scalar UI → https://localhost:7029/scalar
```

### Frontend Setup
```bash
cd Student-Management-System
npm install
ng serve
# App → http://localhost:4200
```

### Database Seed SQL
```sql
-- Statuses
INSERT INTO Statuses (StatusName, StatusCssClass, CreatedAt, IsDeleted) VALUES
  ('Not Started','bg-secondary',GETDATE(),0),
  ('In Progress','bg-primary',GETDATE(),0),
  ('Completed','bg-success',GETDATE(),0),
  ('On Hold','bg-warning',GETDATE(),0)

-- Priorities
INSERT INTO Priorities (PriorityName, PriorityCssClass, CreatedAt, IsDeleted) VALUES
  ('Low','bg-success',GETDATE(),0),
  ('Medium','bg-warning',GETDATE(),0),
  ('High','bg-danger',GETDATE(),0),
  ('Critical','bg-dark',GETDATE(),0)

-- Admin user (password = "Admin@123", plain text — auto-upgrades to BCrypt on first login)
INSERT INTO Users (FullName, Email, Password, MobileNumber, IsActive, IsDeleted, CreatedAt)
VALUES ('Admin User','admin@spms.com','Admin@123','9876543210',1,0,GETDATE())

-- Assign Admin role (replace X with actual RoleId for Admin)
INSERT INTO UserRoles (UserId, RoleId, CreatedAt, IsDeleted)
VALUES (SCOPE_IDENTITY(), X, GETDATE(), 0)
```

### First Login
1. Visit `https://localhost:7029` → accept dev certificate
2. Open `http://localhost:4200`
3. Click **Admin** quick sign-in → Sign In
4. First login auto-upgrades password from plain text to BCrypt

---

## 12. Known Limitations & Future Work

| Item | Status | Notes |
|---|---|---|
| Refresh token | ❌ | JWT is 8h; users re-login after expiry |
| Email notifications | ❌ | Task assignments, deadline reminders |
| Bulk user import | ❌ | CSV upload for students/faculty |
| Report export | ❌ | PDF/Excel project/task reports |
| Real-time updates | ❌ | SignalR for live progress |
| Current password verification | ⚠️ | Backend accepts new pwd without verifying old |
| Duplicate email check (service layer) | ⚠️ | DB unique constraint returns 500; should be 409 |
| Multi-student project allocation | ⚠️ | Only first allocation shown in project list |
| Rate limiting on login | ❌ | No brute-force protection |
| Production config | ❌ | JWT key and connection string should use env vars |

---

*SPMS v1.0 — MCA Semester 3 .NET Project*
*Backend: ASP.NET Core 10 | Frontend: Angular 19 | DB: SQL Server Express*

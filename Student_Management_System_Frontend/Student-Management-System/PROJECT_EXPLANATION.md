# Student Project Management System (SPMS)
### Full Technical Documentation

> This file documents the complete SPMS project — backend and frontend together.
> Backend: ASP.NET Core 10 | Frontend: Angular 19 | DB: SQL Server Express

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
| AutoMapper | 12.0.1 | DTO ↔ Model mapping |
| BCrypt.Net-Next | 4.2.0 | Password hashing |
| FluentValidation.AspNetCore | 11.3.0 | Input validation |
| FluentValidation.DependencyInjectionExtensions | 11.5.1 | Auto DI registration |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.12 | JWT auth |
| Scalar.AspNetCore | 2.16.17 | API documentation UI |

### Frontend
| Package | Purpose |
|---|---|
| Angular 19+ | SPA framework (standalone components) |
| Angular Material | UI component library |
| ng2-charts + Chart.js | Dashboard charts |
| RxJS | Reactive data streams |

### Database
- **SQL Server Express** — `StudentManagementSystemDb`
- Windows Authentication

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Frontend                      │
│  Admin Dashboard │ Faculty Dashboard │ Student Dashboard │
│                                                          │
│  Core Services (HTTP + shareReplay cache)                │
│  authInterceptor — attaches JWT, catches 401 → logout   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS + Bearer token
┌─────────────────────────┼───────────────────────────────┐
│               ASP.NET Core Web API                       │
│  FluentValidation → Controllers → Services → EF Core    │
│  Auth/ | Admin/ | Faculty/ | Student/ controllers       │
└──────────────────────────────────────────────────────────┘
                          │
             ┌────────────▼────────────┐
             │   SQL Server Express    │
             │  StudentManagementSystemDb │
             └─────────────────────────┘
```

### Middleware Pipeline
```
UseCors → UseHttpsRedirection → UseStaticFiles →
UseAuthentication → UseAuthorization → MapControllers
```

---

## 4. Database Schema

### Key Tables

| Table | Primary Key | Important Columns |
|---|---|---|
| Users | UserId | Email (unique), Password (BCrypt), IsDeleted (soft-delete) |
| Roles | RoleId | RoleName (unique) — Admin, Faculty, Student |
| UserRoles | RolePermissionId | UserId FK, RoleId FK |
| Statuses | StatusID | StatusName (unique), StatusCssClass (bg-*) |
| Priorities | PriorityID | PriorityName (unique), PriorityCssClass (bg-*) |
| Projects | ProjectId | FacultyId FK, ProjectStatus FK, TotalTasks, ProgressPercentage |
| ProjectAllocations | AllocationID | ProjectId FK, StudentId FK — unique (ProjectId, StudentId) |
| Tasks | TaskId | AllocationID FK, TaskStatus FK, PriorityID FK, AssignedScore, EarnedScore |

All tables inherit from `BaseEntity`: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`.  
`SaveChangesAsync` override auto-sets `CreatedAt` on Add and `UpdatedAt` on Modify.

---

## 5. Backend — API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/login` | None | Returns JWT + user info |

### Users (`/api/users`)
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/users` | Admin |
| GET | `/api/users/{id}` | Admin, Faculty, Student |
| POST | `/api/users` | Admin |
| PUT | `/api/users/{id}` | Admin |
| DELETE | `/api/users/{id}` | Admin |
| POST | `/api/users/{id}/avatar` | Own ID only (Admin can any) |

### Roles, Statuses, Priorities
All under `/api/roles`, `/api/status`, `/api/admin/priorities` — Admin only, full CRUD.

### Projects
| Endpoint | Role | Notes |
|---|---|---|
| GET `/api/admin/projects` | Admin | All, enriched with student info |
| GET `/api/faculty/projects` | Faculty | Own only |
| GET `/api/student/projects` | Student | Allocated only |
| POST/PUT/DELETE `/api/admin/projects` | Admin | Delete cascades to allocations + tasks |
| POST `/api/faculty/projects` | Faculty | Auto-sets own facultyId |

### Tasks
| Endpoint | Role |
|---|---|
| GET/POST/PUT/DELETE `/api/admin/tasks` | Admin |
| GET/POST/PUT/DELETE `/api/faculty/tasks` | Faculty |
| GET `/api/student/tasks` | Student |
| PATCH `/api/student/tasks/{id}/remarks` | Student (remarks only) |

Task create/update auto-sets `ProgressPercentage` from status name and recalculates parent project progress.

### Dashboards
| Endpoint | Role | Returns |
|---|---|---|
| GET `/api/admin/dashboard/stats` | Admin | KPIs, chart distributions, recent data |
| GET `/api/faculty/dashboard/stats` | Faculty | KPIs, project progress, upcoming tasks |
| GET `/api/student/dashboard/stats` | Student | KPIs, my projects, upcoming tasks |

### Error Format
```json
{
  "message": "Validation failed.",
  "errors": [
    { "field": "Email", "message": "Email is required." }
  ]
}
```

---

## 6. FluentValidation Rules

All validation is in `Validators/` — DTOs have no DataAnnotations.

| Validator | Key Rules |
|---|---|
| `LoginValidator` | Email format · Password min 4 |
| `UserValidator` | Name letters-only · Email format · Password strength (U+L+D, min 8) · Password required on create, optional on update · Mobile 7–15 digits |
| `RoleValidator` | Name letters-only · Max 50 |
| `StatusValidator` | Name letters-only · CssClass must be one of 8 allowed `bg-*` values |
| `PriorityValidator` | Same as Status |
| `ProjectValidator` | StartDate < EndDate · FacultyId > 0 · Status > 0 |
| `TaskValidator` | EarnedScore ≤ AssignedScore · Score 0–100 · StartDate < DueDate |
| `ProjectAllocationValidator` | ProjectId > 0 · StudentId > 0 |
| `UserRoleValidator` | UserId > 0 · RoleId > 0 |

---

## 7. JWT Authentication & Authorization

```json
"Jwt": {
  "Key": "ya6rxLu8fUSqG3JcfiBhQW8QsSJnyZijpvBgTYHV2RN",
  "Issuer": "StudentManagementSystem",
  "Audience": "StudentManagementSystemUsers",
  "ExpiresInMinutes": 480
}
```

**Claims:** NameIdentifier (UserId), Email, Name, Role, Jti  
**Passwords:** BCrypt hashed. Plain-text passwords auto-upgrade on first login.  
**Frontend:** `authInterceptor` attaches `Authorization: Bearer <token>` to every request. Any `401` response → `auth.logout()` → redirect to `/auth/login`.

---

## 8. Frontend — Module Guide

### Routes
| Path | Roles |
|---|---|
| `/auth/login` | Public |
| `/dashboard/admin` | Admin |
| `/dashboard/faculty` | Faculty |
| `/dashboard/student` | Student |
| `/masters/roles`, `/users`, `/students`, `/faculty`, `/status`, `/priority` | Admin |
| `/projects`, `/tasks` | Admin, Faculty, Student |
| `/profile` | All authenticated |

### Services & Caching
All services use `shareReplay({ bufferSize: 1, refCount: true })` cache — cleared on every write (`invalidateCache()`).  
`ProjectService` and `TaskService` use **role-aware API URLs** — the base URL switches based on `auth.currentRole()`.

### CSS Normalisation
All services map `bg-*` DB values → `badge-*` display classes via a `mapCssClass()` helper.

### Profile
Accessible via sidebar footer or topnav user dropdown.  
- Edit name/mobile → `PUT /api/users/{id}`  
- Avatar upload → `POST /api/users/{id}/avatar` (JPEG/PNG ≤ 2MB)  
- Password change → `PUT /api/users/{id}` with new password  

---

## 9. Role-Based Access Control

| Feature | Admin | Faculty | Student |
|---|---|---|---|
| All Dashboards | ✅ own | ✅ own | ✅ own |
| Masters (Roles/Users/Status/Priority) | ✅ | ❌ | ❌ |
| All Projects | ✅ | Own only | Own only |
| All Tasks | ✅ | Own only | Own only |
| Create/Edit Tasks | ✅ | ✅ | ❌ |
| Student Remarks | ✅ | ✅ | ✅ own |
| Profile | ✅ | ✅ | ✅ |
| Upload any avatar | ✅ | Own only | Own only |

---

## 10. File & Folder Structure

```
Student_Management_System_backend/
├── Controllers/Auth/, Admin/, Faculty/, Student/
├── DTO/                    ← Clean DTOs (no DataAnnotations)
├── Validators/             ← 9 FluentValidation validators
├── Services/Interface/ + Implementation/
├── Model/                  ← EF Core entity models
├── Mapping/MappingProfile.cs
├── Data/AppDbContext.cs
├── Migrations/
├── wwwroot/uploads/avatars/
├── appsettings.json
└── Program.cs

Student-Management-System/src/app/
├── core/guards/, interceptors/, models/, services/
├── features/auth/, dashboard/, masters/, projects/, tasks/, profile/
├── layout/shell/, sidebar/, topnav/, breadcrumb/
└── shared/components/
    app-table, app-drawer, app-badge, app-skeleton,
    app-toast, app-confirm-dialog, kpi-card
```

---

## 11. Setup & Run Guide

### Backend
```bash
cd Student_Management_System_backend
dotnet restore
dotnet run
# https://localhost:7029
# Scalar UI: https://localhost:7029/scalar
```

### Frontend
```bash
cd Student-Management-System
npm install
ng serve
# http://localhost:4200
```

### Database Seed SQL
```sql
INSERT INTO Statuses (StatusName, StatusCssClass, CreatedAt, IsDeleted) VALUES
  ('Not Started','bg-secondary',GETDATE(),0), ('In Progress','bg-primary',GETDATE(),0),
  ('Completed','bg-success',GETDATE(),0),     ('On Hold','bg-warning',GETDATE(),0)

INSERT INTO Priorities (PriorityName, PriorityCssClass, CreatedAt, IsDeleted) VALUES
  ('Low','bg-success',GETDATE(),0), ('Medium','bg-warning',GETDATE(),0),
  ('High','bg-danger',GETDATE(),0), ('Critical','bg-dark',GETDATE(),0)

-- Create admin (password auto-upgrades to BCrypt on first login)
INSERT INTO Users (FullName,Email,Password,MobileNumber,IsActive,IsDeleted,CreatedAt)
VALUES ('Admin User','admin@spms.com','Admin@123','9876543210',1,0,GETDATE())

INSERT INTO UserRoles (UserId,RoleId,CreatedAt,IsDeleted)
VALUES (SCOPE_IDENTITY(), <AdminRoleId>, GETDATE(), 0)
```

### First Login
1. Open `https://localhost:7029` → accept dev certificate
2. Open `http://localhost:4200`
3. Click **Admin** → Sign In (password auto-upgrades to BCrypt on first login)

---

## 12. Known Limitations & Future Work

| Item | Status |
|---|---|
| Refresh token | ❌ Not implemented |
| Email notifications | ❌ Not implemented |
| Report export (PDF/Excel) | ❌ Not implemented |
| Real-time updates (SignalR) | ❌ Not implemented |
| Current password verification on change | ⚠️ Partial |
| Duplicate email returns 409 (not 500) | ⚠️ Partial |
| Rate limiting on login | ❌ Not implemented |
| JWT key in environment variables | ❌ Currently in appsettings.json |

---

*SPMS v1.0 — MCA Semester 3 .NET Project*

# Requirements Document

## Introduction

The Student Project Management System (SPMS) is a modern, enterprise-grade Angular 20+ frontend application for managing academic projects assigned to students under faculty supervision. The system implements a role-based access control model with three distinct roles — Admin, Faculty, and Student — each presenting a tailored experience. The UI is inspired by Azure DevOps, Jira, and Linear, combining Angular Material components with Tailwind CSS utility classes. All CRUD operations use in-place drawer or dialog patterns rather than separate pages, and the service layer is designed for seamless swap from mock JSON data to a live REST API.

---

## Glossary

- **SPMS**: Student Project Management System — the application being specified.
- **Admin**: A user with the Admin role who manages all system data including users, roles, statuses, priorities, projects, and tasks.
- **Faculty**: A user with the Faculty role who supervises projects, grades tasks, and reviews student progress.
- **Student**: A user with the Student role who works on assigned projects and tasks.
- **User**: Any authenticated account in the system, stored in SPM_User. Students and Faculty are filtered views of this same entity.
- **Role**: A named permission level stored in SPM_Role (Admin, Faculty, Student).
- **Project**: An academic project stored in SPM_Project, linking one Student and one Faculty member.
- **Task**: A unit of work stored in SPM_Task, associated with a Project.
- **Status**: A configurable workflow state stored in SPM_Status (e.g., Not Started, In Progress, Completed, On Hold).
- **Priority**: A configurable urgency level stored in SPM_Priority (e.g., Low, Medium, High, Critical).
- **Drawer**: A right-side slide-in panel used for Add/Edit forms, keeping the user on the same page.
- **JWT**: JSON Web Token used for stateless authentication.
- **Mock Service**: An Angular service that returns static in-memory data, swappable to a real HTTP API.
- **AppTable**: The reusable configurable table component used across all list views.
- **AppDrawer**: The reusable right-side drawer component used for all Add/Edit forms.
- **ProgressPercentage**: The auto-calculated ratio of completed tasks to total tasks for a project, expressed as a percentage (0–100).

---

## Requirements

---

### Requirement 1: User Authentication

**User Story:** As a user, I want to log in with my email and password so that I can access my role-specific dashboard and features.

#### Acceptance Criteria

1. THE Login_Page SHALL display an email field, a password field, a "Remember Me" checkbox, a password-visibility toggle, and a login button.
2. WHEN a user submits valid credentials, THE Authentication_Service SHALL validate the credentials against the mock user store and return a JWT token.
3. WHEN login succeeds, THE Router SHALL redirect the user to the dashboard route corresponding to the user's assigned role (Admin → `/dashboard/admin`, Faculty → `/dashboard/faculty`, Student → `/dashboard/student`).
4. IF submitted credentials do not match any user record, THEN THE Login_Page SHALL display an inline error message reading "Invalid email or password."
5. THE Login_Page SHALL display demo credential hints for at least one Admin, one Faculty, and one Student account to facilitate testing.
6. WHERE the "Remember Me" checkbox is checked, THE Authentication_Service SHALL persist the JWT token in `localStorage`; WHERE it is unchecked, THE Authentication_Service SHALL persist the token in `sessionStorage`.
7. WHEN a user clicks the logout action, THE Authentication_Service SHALL remove the stored token and redirect to the login page.

---

### Requirement 2: JWT Token Management and Route Guards

**User Story:** As a developer, I want the application to attach JWT tokens to API requests and enforce role-based access on routes so that unauthorized users cannot access protected data or pages.

#### Acceptance Criteria

1. THE Auth_Interceptor SHALL attach an `Authorization: Bearer <token>` header to every outgoing HTTP request when a valid token exists in storage.
2. WHEN a route requiring authentication is accessed without a valid token, THE Auth_Guard SHALL redirect the user to the login page.
3. WHEN a route restricted to a specific role is accessed by a user with a different role, THE Role_Guard SHALL redirect the user to their own dashboard.
4. THE Auth_Service SHALL expose a `currentUser` signal that emits the decoded JWT payload, including UserId, FullName, Email, and RoleName.
5. IF the stored JWT token has expired, THEN THE Auth_Interceptor SHALL remove the token from storage and redirect the user to the login page.

---

### Requirement 3: Application Shell — Layout

**User Story:** As a user, I want a consistent shell layout with a sidebar, top navigation bar, and breadcrumbs so that I can navigate the application efficiently.

#### Acceptance Criteria

1. THE Shell_Component SHALL render a collapsible left sidebar, a top navigation bar, and a main content area on every authenticated route.
2. WHEN the sidebar collapse toggle is activated, THE Sidebar_Component SHALL animate between expanded (240 px wide, showing icons and labels) and collapsed (64 px wide, showing icons only) states, and SHALL persist the state in `localStorage`.
3. THE Top_Navbar_Component SHALL display the application name/logo, a global search input, a light/dark theme toggle, and a user avatar menu with profile and logout actions.
4. THE Breadcrumb_Component SHALL automatically reflect the current route hierarchy and update on every route navigation event.
5. WHILE the viewport width is less than 768 px, THE Shell_Component SHALL hide the sidebar and render a hamburger menu that opens the sidebar as an overlay.
6. THE Shell_Component SHALL support a light theme and a dark theme, applying the selected theme class to the document root, and SHALL persist the preference in `localStorage`.

---

### Requirement 4: Role-Based Dashboard — Admin

**User Story:** As an Admin, I want a dashboard that shows system-wide statistics and recent activity so that I can monitor the health of the platform.

#### Acceptance Criteria

1. THE Admin_Dashboard_Component SHALL display summary KPI cards showing: total users, total students, total faculty, total projects, and total tasks.
2. THE Admin_Dashboard_Component SHALL render a doughnut or pie chart showing the distribution of projects across all Status values.
3. THE Admin_Dashboard_Component SHALL render a bar chart showing the distribution of tasks across all Priority values.
4. THE Admin_Dashboard_Component SHALL display a "Recent Projects" table showing the 5 most recently created projects with columns for title, student name, faculty name, status chip, and progress bar.
5. THE Admin_Dashboard_Component SHALL display a "Recent Tasks" table showing the 5 most recently created tasks with columns for title, project name, priority chip, status chip, and due date.
6. WHEN dashboard data is loading, THE Admin_Dashboard_Component SHALL display skeleton loader placeholders for each KPI card and chart.

---

### Requirement 5: Role-Based Dashboard — Faculty

**User Story:** As a Faculty member, I want a dashboard focused on my supervised projects and student performance so that I can prioritize my review work.

#### Acceptance Criteria

1. THE Faculty_Dashboard_Component SHALL display KPI cards showing: my total supervised projects, total tasks across my projects, tasks completed, and tasks overdue.
2. THE Faculty_Dashboard_Component SHALL display a list of upcoming task deadlines (due within the next 7 days) across all projects the faculty member supervises.
3. THE Faculty_Dashboard_Component SHALL display a progress chart showing the completion percentage for each of the faculty member's active projects.
4. WHEN a faculty member has no supervised projects, THE Faculty_Dashboard_Component SHALL display a contextual empty-state message.

---

### Requirement 6: Role-Based Dashboard — Student

**User Story:** As a Student, I want a dashboard showing my assigned projects and tasks with progress indicators so that I can track my academic workload.

#### Acceptance Criteria

1. THE Student_Dashboard_Component SHALL display KPI cards showing: my assigned projects count, my total tasks count, completed tasks count, and pending tasks count.
2. THE Student_Dashboard_Component SHALL display a progress tracker listing each of my projects with a progress bar reflecting the project's ProgressPercentage.
3. THE Student_Dashboard_Component SHALL display a list of upcoming task deadlines (due within the next 7 days) for tasks assigned to the logged-in student.
4. WHEN a student has no assigned tasks, THE Student_Dashboard_Component SHALL display a contextual empty-state message.

---

### Requirement 7: Role Management

**User Story:** As an Admin, I want to manage roles so that I can control what role names exist in the system.

#### Acceptance Criteria

1. THE Role_List_Component SHALL display all roles in an `AppTable` with columns: Role Name, Description, and Actions (Edit, Delete).
2. THE Role_List_Component SHALL provide search, column visibility toggle, and refresh controls above the table.
3. WHEN the "Add Role" button is clicked, THE AppDrawer SHALL open with an empty reactive form containing fields: Role Name (required, max 50 characters) and Description (optional, max 255 characters).
4. WHEN an edit action is triggered for a role, THE AppDrawer SHALL open pre-populated with the selected role's data.
5. WHEN a role form is submitted with valid data, THE Role_Service SHALL save the role and THE AppToast_Service SHALL display a success notification.
6. IF a role name already exists in the system during creation or update, THEN THE Role_Service SHALL return a duplicate error and THE Role_List_Component SHALL display the error message below the Role Name field.
7. WHEN a delete action is triggered, THE AppConfirmDialog_Component SHALL prompt for confirmation before THE Role_Service removes the record.

---

### Requirement 8: User Management

**User Story:** As an Admin, I want to manage all users in the system so that I can create accounts, assign roles, and control access.

#### Acceptance Criteria

1. THE User_List_Component SHALL display all users in an `AppTable` with columns: Profile Picture, Full Name, Email, Mobile Number, Role(s), Active Status chip, and Actions (Edit, Delete, View).
2. THE User_List_Component SHALL provide filters for Role and IsActive status, plus global search, column visibility, export (Excel and PDF), and refresh controls.
3. WHEN the "Add User" button is clicked, THE AppDrawer SHALL open with a reactive form containing: Full Name (required), Email (required, valid email format), Password (required, min 8 characters, with toggle visibility), Mobile Number (optional, valid phone format), Role (required, searchable dropdown from Role list), IsActive (toggle, default true), and Profile Picture (optional, image upload with preview).
4. WHEN an edit action is triggered for a user, THE AppDrawer SHALL open pre-populated with the selected user's data, with Password field empty and optional.
5. IF a submitted email address already exists in the system, THEN THE User_Service SHALL return a duplicate error and THE AppDrawer form SHALL display the error below the Email field.
6. WHEN a delete action is triggered, THE AppConfirmDialog_Component SHALL prompt for confirmation; IF the user has active project assignments, THEN THE User_Service SHALL prevent deletion and display an informational error message.
7. THE User_List_Component SHALL support bulk selection and bulk delete via a confirmation dialog.
8. THE User_List_Component SHALL support export to Excel and export to PDF of the currently filtered/sorted data set.

---

### Requirement 9: Students Filtered View

**User Story:** As an Admin, I want a dedicated Students view that shows only users with the Student role so that I can manage student accounts without seeing all users.

#### Acceptance Criteria

1. THE Student_List_Component SHALL display all users where RoleName = "Student" using the same `AppTable` pattern as the User_List_Component.
2. THE Student_List_Component SHALL include an additional "Assigned Projects" column showing the count of active projects linked to each student.
3. WHEN an add or edit action is triggered from the Student view, THE AppDrawer form SHALL default the Role field to "Student" and lock it from editing.
4. THE Student_List_Component SHALL inherit all search, filter, sort, pagination, export, and bulk-delete capabilities defined in Requirement 8.

---

### Requirement 10: Faculty Filtered View

**User Story:** As an Admin, I want a dedicated Faculty view that shows only users with the Faculty role so that I can manage faculty accounts separately.

#### Acceptance Criteria

1. THE Faculty_List_Component SHALL display all users where RoleName = "Faculty" using the same `AppTable` pattern as the User_List_Component.
2. THE Faculty_List_Component SHALL include an additional "Supervised Projects" column showing the count of active projects where the user is the supervising faculty.
3. WHEN an add or edit action is triggered from the Faculty view, THE AppDrawer form SHALL default the Role field to "Faculty" and lock it from editing.
4. THE Faculty_List_Component SHALL inherit all search, filter, sort, pagination, export, and bulk-delete capabilities defined in Requirement 8.

---

### Requirement 11: Status Management

**User Story:** As an Admin, I want to configure workflow statuses so that projects and tasks reflect meaningful lifecycle states.

#### Acceptance Criteria

1. THE Status_List_Component SHALL display all statuses in an `AppTable` with columns: Status Name, CSS Class (as a colored preview badge), and Actions (Edit, Delete).
2. WHEN the "Add Status" button is clicked, THE AppDrawer SHALL open with a reactive form containing: Status Name (required, max 50 characters) and Status CSS Class (required, e.g., `badge-success`).
3. WHEN a status form is submitted, THE Status_Service SHALL save the record and THE AppToast_Service SHALL display a success notification.
4. WHEN a delete action is triggered, THE AppConfirmDialog_Component SHALL prompt for confirmation; IF the status is referenced by any active project or task, THEN THE Status_Service SHALL prevent deletion and display an informational error message.
5. IF a status name already exists, THEN THE Status_Service SHALL return a duplicate error and the form SHALL display the error below the Status Name field.

---

### Requirement 12: Priority Management

**User Story:** As an Admin, I want to configure task priority levels so that tasks can be triaged by urgency.

#### Acceptance Criteria

1. THE Priority_List_Component SHALL display all priorities in an `AppTable` with columns: Priority Name, CSS Class (as a colored preview badge), and Actions (Edit, Delete).
2. WHEN the "Add Priority" button is clicked, THE AppDrawer SHALL open with a reactive form containing: Priority Name (required, max 50 characters) and Priority CSS Class (required, e.g., `badge-danger`).
3. WHEN a priority form is submitted, THE Priority_Service SHALL save the record and THE AppToast_Service SHALL display a success notification.
4. WHEN a delete action is triggered, THE AppConfirmDialog_Component SHALL prompt for confirmation; IF the priority is referenced by any active task, THEN THE Priority_Service SHALL prevent deletion and display an informational error message.
5. IF a priority name already exists, THEN THE Priority_Service SHALL return a duplicate error and the form SHALL display the error below the Priority Name field.

---

### Requirement 13: Project Management — List

**User Story:** As an Admin or Faculty member, I want to see a filterable, sortable list of all projects so that I can monitor project health at a glance.

#### Acceptance Criteria

1. THE Project_List_Component SHALL display all projects in an `AppTable` with columns: Project Title, Student Name, Faculty Name, Status chip, Progress bar (ProgressPercentage), Start Date, End Date, and Actions (View, Edit, Delete).
2. THE Project_List_Component SHALL provide: global text search, a Status filter dropdown, a date-range filter for Start Date / End Date, column visibility toggle, export (Excel and PDF), and refresh controls.
3. THE Project_List_Component SHALL support pagination with configurable page size (10, 25, 50 rows).
4. WHEN logged in as Faculty, THE Project_List_Component SHALL automatically pre-filter to show only projects supervised by the logged-in faculty member.
5. THE Project_List_Component SHALL support row selection and bulk delete.

---

### Requirement 14: Project Management — Add/Edit Drawer

**User Story:** As an Admin or Faculty member, I want to create and update projects in a right-side drawer so that I remain on the list page throughout the workflow.

#### Acceptance Criteria

1. WHEN the "Add Project" button is clicked, THE AppDrawer SHALL open with an empty reactive form containing: Project Title (required, max 200 characters), Description (optional, max 1000 characters, with character counter), Start Date (required, date picker), End Date (required, date picker, must be after Start Date), Status (required, searchable dropdown from Status list), Supervising Faculty (required, searchable dropdown of users with Role = Faculty), and Assigned Student (required, searchable dropdown of users with Role = Student).
2. IF End Date is before Start Date, THEN THE Project_Form SHALL display a validation error on the End Date field reading "End date must be after start date."
3. WHEN a project form is submitted with valid data, THE Project_Service SHALL save the project and THE AppToast_Service SHALL display a success notification, then close the drawer.
4. WHEN an edit action is triggered for a project, THE AppDrawer SHALL open pre-populated with the selected project's data.
5. WHEN a delete action is triggered, THE AppConfirmDialog_Component SHALL prompt for confirmation before removal.

---

### Requirement 15: Project Detail View

**User Story:** As an Admin, Faculty, or Student, I want to view a detailed project page with tabs so that I can see all project information in one place without navigating away.

#### Acceptance Criteria

1. WHEN a "View" action is triggered for a project, THE Project_Detail_Component SHALL open in an `AppDrawer` with four tabs: Overview, Members, Tasks, and Timeline/Progress.
2. THE Overview_Tab SHALL display Project Title, Description, Status chip, Start Date, End Date, assigned Faculty name, assigned Student name, and a circular progress indicator showing ProgressPercentage.
3. THE Members_Tab SHALL display the supervising faculty's profile card and the assigned student's profile card, each showing name, email, and profile picture.
4. THE Tasks_Tab SHALL display all tasks associated with the project in a compact table with columns: Task Title, Status chip, Priority chip, Due Date, Assigned Score, Earned Score, and an action to view/edit the task.
5. THE Timeline_Tab SHALL display a visual progress bar per task using start and due dates, and the overall project completion percentage.

---

### Requirement 16: Task Management — List

**User Story:** As an Admin, Faculty, or Student, I want a filterable task list so that I can quickly locate and manage specific tasks.

#### Acceptance Criteria

1. THE Task_List_Component SHALL display all tasks in an `AppTable` with columns: Task Title, Project Name, Assigned Student, Priority chip, Status chip, Due Date, Progress %, Assigned Score, Earned Score, and Actions (View, Edit, Delete).
2. THE Task_List_Component SHALL provide: global text search, Status filter, Priority filter, Project filter (searchable dropdown), column visibility toggle, export (Excel and PDF), and refresh controls.
3. WHEN logged in as Student, THE Task_List_Component SHALL automatically pre-filter to show only tasks assigned to the logged-in student.
4. WHEN logged in as Faculty, THE Task_List_Component SHALL automatically pre-filter to show only tasks belonging to projects supervised by the logged-in faculty member.
5. THE Task_List_Component SHALL support pagination with configurable page size (10, 25, 50 rows).

---

### Requirement 17: Task Management — Add/Edit Drawer

**User Story:** As an Admin or Faculty member, I want to create and update tasks in a right-side drawer so that I remain on the list page throughout the workflow.

#### Acceptance Criteria

1. WHEN the "Add Task" button is clicked, THE AppDrawer SHALL open with an empty reactive form containing: Task Title (required, max 200 characters), Task Description (optional, max 1000 characters, with character counter), Project (required, searchable dropdown), Assigned Student (auto-populated from the selected project's student, read-only), Priority (required, searchable dropdown from Priority list), Status (required, searchable dropdown from Status list), Start Date (required, date picker), Due Date (required, date picker, must be after Start Date), and Assigned Score (optional, numeric, 0–100).
2. WHEN the Project field value changes, THE Task_Form SHALL automatically populate the Assigned Student field with the student linked to the selected project.
3. IF Due Date is before Start Date, THEN THE Task_Form SHALL display a validation error on the Due Date field.
4. WHEN a task form is submitted with valid data, THE Task_Service SHALL save the task, recalculate the parent project's ProgressPercentage, and THE AppToast_Service SHALL display a success notification.
5. WHEN a Faculty user edits a task, THE AppDrawer form SHALL additionally expose: Faculty Remarks (textarea, max 500 characters) and Earned Score (numeric, 0–100, must not exceed Assigned Score).
6. WHEN a Student user views/edits a task, THE AppDrawer form SHALL expose a read-only view of task details plus a Student Remarks field (textarea, max 500 characters), with all other fields disabled.
7. IF Earned Score exceeds Assigned Score, THEN THE Task_Form SHALL display a validation error on the Earned Score field.

---

### Requirement 18: Progress Calculation

**User Story:** As a user, I want project progress percentages to update automatically when task statuses change so that progress always reflects actual work.

#### Acceptance Criteria

1. WHEN a task's Status is updated to the "Completed" status value, THE Task_Service SHALL increment the parent project's CompletedTasks counter.
2. WHEN a task's Status is updated away from "Completed," THE Task_Service SHALL decrement the parent project's CompletedTasks counter.
3. THE Project_Service SHALL calculate ProgressPercentage as `(CompletedTasks / TotalTasks) * 100`, rounded to the nearest integer, WHEN TotalTasks is greater than 0.
4. IF TotalTasks is 0, THEN THE Project_Service SHALL set ProgressPercentage to 0.
5. FOR ALL projects, ProgressPercentage SHALL satisfy the invariant: `0 <= ProgressPercentage <= 100`.

---

### Requirement 19: Reusable AppTable Component

**User Story:** As a developer, I want a single configurable table component so that every list view in the application shares consistent UX patterns.

#### Acceptance Criteria

1. THE AppTable_Component SHALL accept an `columns` input defining column key, header label, sortable flag, and optional cell template.
2. THE AppTable_Component SHALL accept a `dataSource` input of type array and internally apply client-side filtering, sorting, and pagination.
3. THE AppTable_Component SHALL provide row checkbox selection with a "select all" header checkbox, exposing a `selectionChange` output event.
4. THE AppTable_Component SHALL render status and priority values as colored `AppBadge_Component` chips when the column type is set to "badge."
5. THE AppTable_Component SHALL expose an `exportExcel` method and an `exportPdf` method callable from the parent component.
6. THE AppTable_Component SHALL display a skeleton loader when the `loading` input is true.
7. WHEN the data source is empty and loading is false, THE AppTable_Component SHALL display a configurable empty-state message.

---

### Requirement 20: Reusable AppDrawer Component

**User Story:** As a developer, I want a reusable right-side drawer component so that all Add/Edit forms have consistent appearance and animation.

#### Acceptance Criteria

1. THE AppDrawer_Component SHALL slide in from the right edge of the viewport with a 300 ms CSS transition when opened, and slide out when closed.
2. THE AppDrawer_Component SHALL accept a `title` input and render it in the drawer header.
3. THE AppDrawer_Component SHALL accept an `ng-content` slot for the form body.
4. WHEN the backdrop or the close button is clicked, THE AppDrawer_Component SHALL emit a `closed` output event and animate out.
5. WHILE a form submission is in progress, THE AppDrawer_Component SHALL display a loading overlay preventing double submission.

---

### Requirement 21: Reusable AppBadge Component

**User Story:** As a developer, I want a badge component that renders status and priority chips consistently with CSS-class-driven colors so that all badges look uniform.

#### Acceptance Criteria

1. THE AppBadge_Component SHALL accept a `label` input (string) and a `cssClass` input (string) and render a pill-shaped chip.
2. THE AppBadge_Component SHALL map the `cssClass` value to a Tailwind CSS background and text color combination.
3. THE AppBadge_Component SHALL be usable inline within `AppTable` cell templates and standalone in detail views.

---

### Requirement 22: AppToast Notification Service

**User Story:** As a user, I want unobtrusive toast notifications for all save, update, and delete operations so that I know whether my action succeeded or failed.

#### Acceptance Criteria

1. THE AppToast_Service SHALL expose `success(message: string)`, `error(message: string)`, `warning(message: string)`, and `info(message: string)` methods.
2. WHEN a toast is triggered, THE Toast_Container_Component SHALL display the toast in the top-right corner of the viewport with an appropriate icon and color.
3. WHEN displayed, THE Toast_Container_Component SHALL automatically dismiss each toast after 4 seconds.
4. THE Toast_Container_Component SHALL support stacking multiple simultaneous toasts.

---

### Requirement 23: AppConfirmDialog Component

**User Story:** As a user, I want a confirmation dialog before any delete action so that I do not accidentally remove data.

#### Acceptance Criteria

1. THE AppConfirmDialog_Component SHALL accept a `message` input and render it inside a Material Dialog with "Confirm" and "Cancel" buttons.
2. WHEN "Confirm" is clicked, THE AppConfirmDialog_Component SHALL return `true` via the dialog's close observable.
3. WHEN "Cancel" is clicked or the dialog backdrop is pressed, THE AppConfirmDialog_Component SHALL return `false` via the dialog's close observable.

---

### Requirement 24: Mock Data Layer

**User Story:** As a developer, I want all services to return realistic mock data by default so that the UI is fully functional without a backend API.

#### Acceptance Criteria

1. THE Mock_Data_Service SHALL provide at minimum: 3 roles (Admin, Faculty, Student), 6 users (1 Admin, 2 Faculty, 3 Students), 4 projects with mixed Status values, 8 tasks across those projects, 4 Status records (Not Started, In Progress, Completed, On Hold), and 4 Priority records (Low, Medium, High, Critical).
2. THE Mock_Data_Service SHALL simulate asynchronous latency by returning data wrapped in `Observable` with a 300 ms `delay` operator.
3. THE Mock_Data_Service SHALL support in-memory create, read, update, and delete operations so that changes persist for the duration of the browser session.
4. FOR ALL mock services, the service interface (method signatures and return types) SHALL be identical to the interface that a real HTTP API service would implement, enabling a one-line swap from mock to real.

---

### Requirement 25: User Profile Page

**User Story:** As any authenticated user, I want to view and update my own profile so that my account information stays current.

#### Acceptance Criteria

1. THE Profile_Component SHALL display the current user's Full Name, Email, Mobile Number, Role(s), and Profile Picture.
2. WHEN the "Edit Profile" button is clicked, THE Profile_Component SHALL enable inline editing of Full Name and Mobile Number, with a save action.
3. WHEN the "Change Password" action is triggered, THE Profile_Component SHALL display a form with Current Password, New Password (min 8 characters), and Confirm New Password fields, validating that New Password and Confirm New Password match.
4. THE Profile_Component SHALL support profile picture upload with preview, accepting JPEG and PNG files up to 2 MB.
5. IF the uploaded profile picture exceeds 2 MB, THEN THE Profile_Component SHALL display a validation error reading "Image must be smaller than 2 MB."
6. WHEN profile changes are saved, THE AppToast_Service SHALL display a success notification.

---

### Requirement 26: Lazy-Loaded Feature Modules

**User Story:** As a developer, I want each feature area to be lazy-loaded so that the initial bundle size is minimized.

#### Acceptance Criteria

1. THE App_Router SHALL configure lazy-loaded routes for: `auth`, `dashboard`, `masters/roles`, `masters/users`, `masters/students`, `masters/faculty`, `masters/status`, `masters/priority`, `projects`, `tasks`, and `profile`.
2. THE App_Router SHALL protect all non-auth routes with the `Auth_Guard`.
3. THE App_Router SHALL protect role-specific routes (e.g., master management) with the `Role_Guard` configured to allow only the Admin role.
4. WHEN a lazy module chunk fails to load (e.g., network error), THE App_Router SHALL navigate to a generic error page and THE AppToast_Service SHALL display an error notification.

---

### Requirement 27: Accessibility and Responsiveness

**User Story:** As a user on any device, I want the application to be accessible and responsive so that I can use it on desktop, tablet, and mobile.

#### Acceptance Criteria

1. THE Shell_Component and all feature components SHALL use semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<section>`) where appropriate.
2. THE AppTable_Component SHALL include `aria-label` attributes on sortable column headers and pagination controls.
3. THE AppDrawer_Component SHALL trap keyboard focus within the drawer while it is open and restore focus to the triggering element upon close.
4. WHILE the viewport width is between 768 px and 1024 px, THE Shell_Component SHALL default the sidebar to collapsed mode.
5. THE Login_Page and all form fields SHALL have associated `<label>` elements and `aria-describedby` links to error message elements.

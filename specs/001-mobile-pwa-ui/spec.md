# Feature Specification: TaskTrove Mobile PWA

**Feature Branch**: `001-mobile-pwa-ui`
**Created**: 2026-04-09
**Status**: Draft
**Input**: User description: "Build a clean, minimal mobile-first PWA to replace TaskTrove's busy default UI"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Complete Tasks (Priority: P1)

A user opens the app on their phone and sees their task inbox — tasks due
today, overdue tasks, and upcoming tasks — in a clean, scannable list. They
tap a task to mark it complete. The list updates immediately. This is the core
loop the user performs dozens of times per day.

**Why this priority**: This is the #1 reason to use the app. If viewing and
completing tasks doesn't work flawlessly, nothing else matters.

**Independent Test**: Open the app, see tasks grouped by
overdue/today/upcoming, tap a checkbox to complete a task, verify the task
moves to completed state. Pull down to refresh and confirm data syncs with
the backend.

**Acceptance Scenarios**:

1. **Given** the user has tasks in TaskTrove, **When** they open the app,
   **Then** they see tasks grouped into "Overdue", "Today", and "Upcoming"
   sections with the most urgent tasks first.
2. **Given** the user sees a task, **When** they tap the completion checkbox,
   **Then** the task is marked complete both visually and on the server
   within 2 seconds.
3. **Given** the user has no tasks, **When** they open the app, **Then** they
   see a friendly empty state with a prompt to add their first task.
4. **Given** the user's network is slow, **When** they complete a task,
   **Then** the UI updates optimistically and syncs when connectivity allows.

---

### User Story 2 - Authenticate and Connect (Priority: P2)

A user installs the PWA and enters their TaskTrove server URL and bearer
token to connect to their self-hosted instance. The credentials are stored
locally and used for all subsequent API calls. On next launch, they go
straight to their task list.

**Why this priority**: Without authentication, the user cannot access any
data. This must work before any other interaction is possible.

**Independent Test**: Enter a server URL and bearer token, verify the app
connects to the API, see the task list load. Close and reopen the app,
confirm it remembers credentials and loads automatically.

**Acceptance Scenarios**:

1. **Given** the user opens the app for the first time, **When** no
   credentials are stored, **Then** they see a setup screen to enter their
   server URL and bearer token.
2. **Given** the user enters valid credentials, **When** they tap "Connect",
   **Then** the app validates the connection (e.g., calls /health or /tasks)
   and navigates to the task list.
3. **Given** the user enters invalid credentials, **When** they tap
   "Connect", **Then** they see a clear error message explaining what went
   wrong (invalid token, server unreachable, etc.).
4. **Given** the user has previously connected, **When** they open the app,
   **Then** they bypass the setup screen and go directly to their tasks.

---

### User Story 3 - Quick-Add a Task (Priority: P3)

A user taps a floating action button to quickly create a new task. They type
a title, optionally set a due date or assign to a project, and tap "Add".
The task appears in their list immediately.

**Why this priority**: Creating tasks is the second most frequent action.
A frictionless quick-add flow is essential for capturing thoughts in the
moment.

**Independent Test**: Tap the FAB, type a task title, tap "Add", verify the
task appears in the inbox and is created on the server.

**Acceptance Scenarios**:

1. **Given** the user is on any screen, **When** they tap the FAB, **Then**
   a quick-add overlay or sheet appears with focus on the title field.
2. **Given** the user types a title and taps "Add", **When** the form
   submits, **Then** the task is created on the server and appears in the
   task list.
3. **Given** the user wants to set optional fields, **When** they expand the
   quick-add form, **Then** they can set a due date and select a project.
4. **Given** the user taps outside the quick-add or presses Escape, **When**
   the form has no content, **Then** the overlay dismisses without creating
   a task.

---

### User Story 4 - View and Edit Task Details (Priority: P4)

A user taps a task in the list to see its full details: description,
subtasks, priority, due date, project, and labels. They can edit any field
and save changes.

**Why this priority**: Viewing details is needed once tasks exist, but the
core loop (US1) works without it. Editing keeps the app self-sufficient —
users don't need to switch to the desktop UI.

**Independent Test**: Tap a task, see all details on a dedicated screen,
edit the title and priority, save, verify changes persist on the server.

**Acceptance Scenarios**:

1. **Given** the user taps a task, **When** the detail screen opens, **Then**
   they see the task's title, description, priority, due date, subtasks,
   project, and labels.
2. **Given** the user edits the title or priority, **When** they save,
   **Then** the changes are sent to the API and reflected in the list view.
3. **Given** the task has subtasks, **When** the user views details, **Then**
   subtasks are listed with individual checkboxes to toggle completion.
4. **Given** the user navigates back from the detail screen, **When** they
   return to the list, **Then** the list reflects any changes they made.

---

### User Story 5 - Filter Tasks by Project (Priority: P5)

A user navigates to a project view to see only tasks assigned to that
project. They can switch between projects or return to the global inbox.

**Why this priority**: Project filtering is useful for focused work but
the global inbox (US1) satisfies the primary use case. This adds
organizational depth.

**Independent Test**: Navigate to a project, see only that project's tasks,
switch to another project, confirm task list updates correctly.

**Acceptance Scenarios**:

1. **Given** the user has projects in TaskTrove, **When** they open
   navigation, **Then** they see a list of projects they can select.
2. **Given** the user selects a project, **When** the view updates, **Then**
   only tasks belonging to that project are shown.
3. **Given** the user selects "Inbox" or "All Tasks", **When** the view
   updates, **Then** all tasks are shown regardless of project.

---

### Edge Cases

- What happens when the server is unreachable after initial setup? App MUST
  show cached data from last successful fetch and display an offline banner.
- What happens when the bearer token expires or becomes invalid? App MUST
  show a clear re-authentication prompt, not a generic error.
- What happens when the user creates a task while offline? Task MUST be
  queued locally and synced when connectivity returns.
- What happens when another client (desktop UI) modifies data? Pull-to-refresh
  and periodic background refresh MUST pick up remote changes.
- What happens when the API returns validation errors on task creation?
  The error message from the API MUST be shown to the user in a readable way.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST connect to a TaskTrove instance via configurable
  base URL and bearer token.
- **FR-002**: System MUST display tasks grouped by overdue, today, and
  upcoming based on due date.
- **FR-003**: System MUST allow marking tasks as complete/incomplete with a
  single tap.
- **FR-004**: System MUST provide a quick-add flow for creating tasks with
  at minimum a title.
- **FR-005**: System MUST display task details including title, description,
  priority, due date, subtasks, project, and labels.
- **FR-006**: System MUST allow editing task properties (title, description,
  priority, due date, project).
- **FR-007**: System MUST allow toggling subtask completion independently.
- **FR-008**: System MUST support filtering tasks by project.
- **FR-009**: System MUST persist authentication credentials locally so users
  don't re-enter them on each launch.
- **FR-010**: System MUST be installable as a PWA from mobile browsers.
- **FR-011**: System MUST show cached task data when the network is
  unavailable.
- **FR-012**: System MUST use optimistic UI updates for task completion to
  feel instant, with rollback on server error.
- **FR-013**: System MUST display priority visually (e.g., color-coded
  indicators for priorities 1-4).

### Key Entities

- **Task**: The core entity. Has title, description, completed status,
  priority (1-4), due date/time, project assignment, labels, subtasks,
  comments, recurring settings, and timestamps.
- **Project**: Organizational container for tasks. Has name, color, and
  sections. Tasks belong to at most one project.
- **Label**: Tagging mechanism for tasks. Has name and color. Tasks can
  have multiple labels.
- **Subtask**: Child item of a task. Has title, completed status, and order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their task list within 3 seconds of opening
  the app (including initial API fetch).
- **SC-002**: Users can complete a task in under 1 second (tap to visual
  confirmation).
- **SC-003**: Users can create a new task in under 10 seconds via quick-add.
- **SC-004**: The app is installable as a PWA on iOS Safari and Android
  Chrome.
- **SC-005**: 90% of common actions (view, complete, add) are achievable
  with one hand on a phone.
- **SC-006**: The app loads and shows cached data within 2 seconds when
  offline.

## Assumptions

- The TaskTrove backend is already running and accessible at a known URL.
- Authentication uses a static bearer token (no OAuth flow or
  login/password — the user obtains the token from TaskTrove settings).
- The TaskTrove API is the experimental v1 API as documented at
  `https://developer.tasktrove.io/api/`.
- The API may change (experimental status) — the client should fail
  gracefully if responses don't match expected schemas.
- Single-user usage — no multi-user or collaboration features needed.
- Push notifications are out of scope for v1.
- File attachments are out of scope for v1.
- Calendar and Kanban views are out of scope for v1.
- Recurring task management (creating/editing recurrence rules) is out of
  scope for v1, though recurring tasks will display correctly.

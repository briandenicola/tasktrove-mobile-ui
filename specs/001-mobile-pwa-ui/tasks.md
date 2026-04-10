# Tasks: TaskTrove Mobile PWA

**Input**: Design documents from `/specs/001-mobile-pwa-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and base configuration

- [ ] T001 Initialize Vite + React 19 + TypeScript project in repository root with `npm create vite@latest . -- --template react-ts`
- [ ] T002 [P] Install and configure TailwindCSS v4 (`@tailwindcss/vite` plugin in `vite.config.ts`, Tailwind directives in `src/index.css`)
- [ ] T003 [P] Install core dependencies: `react-router`, `@tanstack/react-query`, `zod`
- [ ] T004 [P] Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- [ ] T005 [P] Install PWA tooling: `vite-plugin-pwa`
- [ ] T006 Configure TypeScript strict mode in `tsconfig.json` (strict: true, noUncheckedIndexedAccess: true)
- [ ] T007 Configure Vitest in `vite.config.ts` (jsdom environment, test setup file)
- [ ] T008 Configure ESLint with TypeScript rules in `eslint.config.js`
- [ ] T009 [P] Create `public/manifest.json` with app name "TaskTrove", theme color, display: standalone, start_url: "/"
- [ ] T010 [P] Create placeholder PWA icons in `public/icons/` (192x192, 512x512)
- [ ] T011 Configure vite-plugin-pwa in `vite.config.ts` (registerType: autoUpdate, workbox runtime caching)
- [ ] T012 Add npm scripts to `package.json`: `dev`, `build`, `preview`, `test`, `test:watch`, `lint`, `typecheck`
- [ ] T013 Create `.gitignore` for node_modules, dist, .env, coverage

**Checkpoint**: `npm run dev` starts the app, `npm test` runs, `npm run build` produces a PWA-installable build

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T014 Create Zod schemas for TaskTrove API responses in `src/lib/schemas.ts`: TaskSchema, ProjectSchema, LabelSchema, SubtaskSchema, CommentSchema, ApiErrorSchema, TaskListResponseSchema, ProjectListResponseSchema, LabelListResponseSchema
- [ ] T015 Generate TypeScript types from Zod schemas in `src/lib/types.ts` using `z.infer<>`; export branded ID type aliases (TaskId, ProjectId, LabelId)
- [ ] T016 Create runtime configuration module `src/lib/config.ts`: read API base URL and token from localStorage, provide getter/setter functions
- [ ] T017 [P] Create utility functions in `src/lib/utils.ts`: `cn()` class merger, `formatDate()`, `formatRelativeDate()`, `groupTasksByDate()` (overdue/today/upcoming), `getPriorityColor()`
- [ ] T018 Create base API client in `src/api/client.ts`: `createApiClient(baseUrl, token)` factory that returns a typed `apiFetch<T>(path, options)` function with Authorization header injection, JSON parsing, Zod validation, and error handling
- [ ] T019 Create task API functions in `src/api/tasks.ts`: `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()` using the base client
- [ ] T020 [P] Create project API functions in `src/api/projects.ts`: `getProjects()` using the base client
- [ ] T021 [P] Create label API functions in `src/api/labels.ts`: `getLabels()` using the base client
- [ ] T022 Create auth context and hook in `src/hooks/useAuth.ts`: AuthProvider, useAuth() returning `{ baseUrl, token, isAuthenticated, login, logout }`; persist to localStorage
- [ ] T023 Create React Router setup in `src/App.tsx`: QueryClientProvider, AuthProvider, 4 routes (/, /task/:id, /project/:id, /setup), auth guard redirect
- [ ] T024 Create TanStack Query client configuration in `src/App.tsx`: default staleTime, retry logic, `persistQueryClient` to localStorage for offline support
- [ ] T025 [P] Create `src/hooks/useOnlineStatus.ts`: hook that tracks navigator.onLine and fires on online/offline events
- [ ] T026 Write unit tests for `src/api/client.ts` in `tests/api/client.test.ts`: test auth header injection, Zod validation failures, network error handling
- [ ] T027 Write unit tests for `src/lib/utils.ts` in `tests/lib/utils.test.ts`: test date grouping logic, priority colors

**Checkpoint**: API client connects to TaskTrove, schemas validate responses, auth persists across reloads, router navigates between routes

---

## Phase 3: User Story 2 - Authenticate & Connect (Priority: P2) 🎯 MVP Gate

**Goal**: User can enter server URL + token and connect to their TaskTrove instance

**Note**: Implementing US2 before US1 because auth is a prerequisite for loading any data

### Implementation for User Story 2

- [ ] T028 [US2] Create `src/components/ui/Input.tsx`: styled text input with label, error state, mobile-optimized (font-size ≥16px to prevent iOS zoom)
- [ ] T029 [P] [US2] Create `src/components/ui/Button.tsx`: primary/secondary variants, loading state, 44px minimum touch target
- [ ] T030 [US2] Create `src/components/auth/SetupScreen.tsx`: form with server URL input, token input (password field with show/hide toggle), "Connect" button; calls `useAuth().login()`, validates connection via API health check or task fetch
- [ ] T031 [US2] Create `src/pages/SetupPage.tsx`: renders SetupScreen, on success navigates to `/`
- [ ] T032 [US2] Handle connection errors in SetupScreen: display "Server unreachable", "Invalid token (401)", or "Unexpected error" messages based on API response
- [ ] T033 [US2] Write component test for SetupScreen in `tests/components/auth/SetupScreen.test.tsx`: test form validation, successful connect, error states

**Checkpoint**: User opens app → sees setup screen → enters URL + token → connects → redirected to (empty) task list page

---

## Phase 4: User Story 1 - View & Complete Tasks (Priority: P1) 🎯 MVP

**Goal**: User sees their tasks grouped by overdue/today/upcoming and can complete them

### Implementation for User Story 1

- [ ] T034 [US1] Create `src/hooks/useTasks.ts`: `useTasks()` query hook (fetches all tasks), `useCompleteTask()` mutation with optimistic update, `useCreateTask()` mutation
- [ ] T035 [US1] Create `src/components/ui/Checkbox.tsx`: round checkbox with tap animation, 44px touch target, checked/unchecked/loading states
- [ ] T036 [P] [US1] Create `src/components/ui/PriorityBadge.tsx`: colored dot/flag for priorities 1-4
- [ ] T037 [US1] Create `src/components/tasks/TaskItem.tsx`: single task row with checkbox, title, priority badge, due date; tap checkbox to complete, tap row to navigate to detail
- [ ] T038 [US1] Create `src/components/tasks/EmptyState.tsx`: friendly illustration/icon + "No tasks yet" message + prompt to add first task
- [ ] T039 [US1] Create `src/components/tasks/TaskList.tsx`: groups tasks using `groupTasksByDate()`, renders section headers (Overdue, Today, Upcoming, No Date), pull-to-refresh via touch gesture
- [ ] T040 [US1] Create `src/components/layout/AppShell.tsx`: main layout with header (app name), scrollable content area, and slot for FAB
- [ ] T041 [P] [US1] Create `src/components/layout/OfflineBanner.tsx`: thin banner at top when `useOnlineStatus()` reports offline
- [ ] T042 [US1] Create `src/pages/TasksPage.tsx`: renders AppShell with TaskList, handles loading/error states from useTasks()
- [ ] T043 [US1] Write component test for TaskItem in `tests/components/tasks/TaskItem.test.tsx`: test render, checkbox toggle, priority display
- [ ] T044 [US1] Write component test for TaskList in `tests/components/tasks/TaskList.test.tsx`: test grouping, empty state, section headers

**Checkpoint**: User sees tasks grouped by date, taps to complete, sees optimistic update, pull to refresh works, offline banner shows when disconnected

---

## Phase 5: User Story 3 - Quick-Add a Task (Priority: P3)

**Goal**: User taps FAB to quickly create a task with minimal friction

### Implementation for User Story 3

- [ ] T045 [US3] Create `src/components/tasks/QuickAdd.tsx`: bottom sheet/overlay with title input (autofocused), optional due date picker, optional project selector dropdown, "Add" button; calls `useCreateTask()` mutation; dismisses on success or outside tap
- [ ] T046 [US3] Add FAB button to `src/components/layout/AppShell.tsx`: floating action button (bottom-right, 56px, prominent color) that opens QuickAdd
- [ ] T047 [US3] Create `src/hooks/useProjects.ts`: `useProjects()` query hook for project dropdown in QuickAdd
- [ ] T048 [US3] Write component test for QuickAdd in `tests/components/tasks/QuickAdd.test.tsx`: test title-only creation, dismiss behavior, project selection

**Checkpoint**: FAB visible on task list, tap opens quick-add, type title + tap Add creates task, task appears in list

---

## Phase 6: User Story 4 - View & Edit Task Details (Priority: P4)

**Goal**: User taps a task to see full details and edit properties

### Implementation for User Story 4

- [ ] T049 [US4] Create `src/components/tasks/TaskDetail.tsx`: full detail view showing title (editable), description (editable textarea), priority selector (1-4 buttons), due date input, project selector, subtask list with toggleable checkboxes, labels (read-only colored chips), comments (read-only list)
- [ ] T050 [US4] Create `src/hooks/useTasks.ts` additions: `useTask(id)` single-task query, `useUpdateTask()` mutation with optimistic update
- [ ] T051 [US4] Create `src/pages/TaskDetailPage.tsx`: loads task by route param `:id`, renders TaskDetail, back navigation to previous page
- [ ] T052 [US4] Handle save logic in TaskDetail: auto-save on blur or explicit "Save" button, PATCH to API with changed fields only
- [ ] T053 [US4] Write component test for TaskDetail in `tests/components/tasks/TaskDetail.test.tsx`: test field rendering, edit + save, subtask toggle

**Checkpoint**: Tap task in list → detail screen with all fields → edit title/priority/date → save → return to updated list

---

## Phase 7: User Story 5 - Filter by Project (Priority: P5)

**Goal**: User navigates between projects to filter their task view

### Implementation for User Story 5

- [ ] T054 [US5] Create `src/components/layout/BottomNav.tsx`: mobile bottom navigation bar with Inbox (all tasks) + project list; highlights active project
- [ ] T055 [US5] Create `src/components/projects/ProjectNav.tsx`: scrollable project list with color indicators, tap to navigate to `/project/:id`
- [ ] T056 [US5] Create `src/pages/ProjectPage.tsx`: renders AppShell with TaskList filtered to the selected project; uses route param `:id`
- [ ] T057 [US5] Update `src/hooks/useTasks.ts`: add `useTasksByProject(projectId)` derived query that filters cached tasks client-side
- [ ] T058 [US5] Write component test for BottomNav in `tests/components/layout/BottomNav.test.tsx`: test project rendering, active state, navigation

**Checkpoint**: Bottom nav shows projects, tap project → filtered tasks, tap Inbox → all tasks

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass, PWA validation, documentation

- [ ] T059 [P] Create `.github/copilot-instructions.md` with build/test/lint commands, architecture overview, and key conventions
- [ ] T060 [P] Create `README.md` with project description, setup instructions, development commands, and deployment guide
- [ ] T061 Verify PWA installability: test on iOS Safari + Android Chrome, confirm manifest, service worker, and offline caching work
- [ ] T062 Run Lighthouse audit and address any PWA/performance issues (target 90+ PWA score)
- [ ] T063 Run `npm run typecheck && npm run lint && npm test` — fix all errors
- [ ] T063.5 [P] Create `.github/workflows/docker.yml`: GitHub Actions workflow that builds the PWA (`npm run build`), packages `dist/` into a Caddy-based Docker image, and pushes to Docker Hub on tag push or main branch merge; includes build args for cache busting, multi-platform support (amd64/arm64), and a matching `Dockerfile` in the repo root
- [ ] T064 [P] Add `CORS` note to README: user may need to configure TaskTrove's `ALLOWED_ORIGINS` env var for cross-origin API access from the PWA

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US2 Auth (Phase 3)**: Depends on Phase 2 — BLOCKS US1, US3, US4, US5 (need auth to fetch data)
- **US1 Tasks (Phase 4)**: Depends on Phase 3 (needs auth)
- **US3 Quick-Add (Phase 5)**: Depends on Phase 4 (needs task list + FAB in AppShell)
- **US4 Detail (Phase 6)**: Depends on Phase 4 (needs task list to navigate from)
- **US5 Projects (Phase 7)**: Depends on Phase 4 (needs task list infrastructure)
- **Polish (Phase 8)**: Depends on all user stories desired

### Parallel Opportunities

- Within Phase 1: T002, T003, T004, T005, T009, T010, T013 are all parallel
- Within Phase 2: T017, T020, T021, T025 are parallel after T018 is done
- Phase 5 (US3) and Phase 6 (US4) can run in parallel after Phase 4
- Phase 7 (US5) can run in parallel with Phase 5 and Phase 6

## Implementation Strategy

### MVP (Phases 1-4)

Complete Setup → Foundational → Auth → Task List.
At this point the app is **usable**: user connects, sees tasks, completes
tasks. Deploy/demo as MVP.

### Incremental Delivery

1. MVP (Phases 1-4) → deploy
2. Add Quick-Add (Phase 5) → deploy
3. Add Task Detail (Phase 6) → deploy
4. Add Project Filter (Phase 7) → deploy
5. Polish (Phase 8) → final deploy

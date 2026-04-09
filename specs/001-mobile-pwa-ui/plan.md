# Implementation Plan: TaskTrove Mobile PWA

**Branch**: `001-mobile-pwa-ui` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mobile-pwa-ui/spec.md`

## Summary

Build a mobile-first Progressive Web App that acts as a clean, minimal
alternative front-end for the TaskTrove self-hosted task management API.
The app connects to an existing TaskTrove backend via its REST v1 API with
bearer token authentication. Tech stack: React 19 + Vite 6 + TailwindCSS v4 +
TanStack Query v5 + React Router v7 + Zod + vite-plugin-pwa.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 19
**Primary Dependencies**: Vite 6, TailwindCSS v4, TanStack Query v5,
React Router v7, Zod, vite-plugin-pwa (Workbox)
**Storage**: localStorage (auth credentials, UI preferences); API for all
task data; service worker cache for offline static assets
**Testing**: Vitest + React Testing Library
**Target Platform**: Mobile browsers (iOS Safari 16+, Android Chrome 100+),
installable as PWA on home screen
**Project Type**: Progressive Web App (front-end only client)
**Performance Goals**: Initial load < 3s on 3G, task completion < 1s perceived,
Lighthouse PWA score 90+
**Constraints**: Offline-capable for cached data, < 500KB initial JS bundle,
must work on ≤428px viewport, single-hand operable
**Scale/Scope**: Single user, ~5 screens, connecting to one TaskTrove instance

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First | ✅ PASS | All screens designed for ≤428px, 44px touch targets, one-screen navigation |
| II. API-Only Client | ✅ PASS | No backend code, all data via TaskTrove REST API, single typed client layer |
| III. Simplicity | ✅ PASS | 5 screens total (auth, task list, task detail, quick-add, project filter) |
| IV. Type Safety | ✅ PASS | Strict TS, Zod schemas for API validation, branded ID types |
| V. PWA-Native | ✅ PASS | vite-plugin-pwa for manifest, service worker, installability |

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-pwa-ui/
├── spec.md              # Feature specification
├── plan.md              # This file
└── tasks.md             # Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── client.ts            # Base fetch client with auth header injection
│   ├── tasks.ts             # Task CRUD API functions
│   ├── projects.ts          # Project API functions
│   └── labels.ts            # Label API functions
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx     # Main layout wrapper (header, content, FAB)
│   │   ├── BottomNav.tsx    # Mobile bottom navigation bar
│   │   └── OfflineBanner.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx     # Grouped task list (overdue/today/upcoming)
│   │   ├── TaskItem.tsx     # Single task row with checkbox
│   │   ├── TaskDetail.tsx   # Full task detail/edit view
│   │   ├── QuickAdd.tsx     # Quick-add overlay/bottom sheet
│   │   └── EmptyState.tsx
│   ├── projects/
│   │   └── ProjectNav.tsx   # Project list for filtering
│   ├── auth/
│   │   └── SetupScreen.tsx  # Server URL + token entry
│   └── ui/
│       ├── Button.tsx       # Shared button component
│       ├── Input.tsx        # Shared input component
│       ├── Checkbox.tsx     # Task completion checkbox
│       └── PriorityBadge.tsx
├── hooks/
│   ├── useTasks.ts          # TanStack Query hooks for tasks
│   ├── useProjects.ts       # TanStack Query hooks for projects
│   ├── useAuth.ts           # Auth state management
│   └── useOnlineStatus.ts   # Network connectivity detection
├── lib/
│   ├── schemas.ts           # Zod schemas for API responses
│   ├── types.ts             # TypeScript types (inferred from Zod)
│   ├── config.ts            # Runtime configuration (API URL, etc.)
│   └── utils.ts             # Date formatting, grouping helpers
├── pages/
│   ├── TasksPage.tsx        # Main inbox/task list route
│   ├── TaskDetailPage.tsx   # Task detail route
│   ├── ProjectPage.tsx      # Project-filtered task view
│   └── SetupPage.tsx        # Auth setup route
├── App.tsx                  # Router + QueryClient + providers
├── main.tsx                 # Entry point
└── index.css                # Tailwind directives + global styles

public/
├── manifest.json            # PWA manifest
├── icons/                   # PWA icons (192x192, 512x512)
└── favicon.ico

tests/
├── api/
│   └── client.test.ts       # API client unit tests
├── components/
│   ├── TaskItem.test.tsx
│   └── TaskList.test.tsx
└── hooks/
    └── useTasks.test.ts
```

**Structure Decision**: Single-project flat structure. No monorepo or
packages — this is a focused front-end client. Feature directories under
`components/` group related UI. API layer is isolated in `src/api/`.
Business logic lives in hooks. Zod schemas are the single source of truth
for types.

## Key Technical Decisions

### API Client Architecture
- Single `createClient(baseUrl, token)` factory in `src/api/client.ts`
- Returns typed methods for each endpoint group
- All responses validated through Zod schemas at the boundary
- Optimistic updates via TanStack Query mutation callbacks

### State Management
- **Server state**: TanStack Query handles caching, refetching, optimistic
  updates, and offline support via `persistQueryClient`
- **Auth state**: React Context + localStorage (URL, token)
- **UI state**: React local state (no global UI store needed for 5 screens)

### Offline Strategy
- Service worker caches static assets (app shell, JS, CSS, icons)
- TanStack Query `persistQueryClient` caches last-known API data to
  localStorage
- Mutations queue locally when offline, replay on reconnect
- `useOnlineStatus` hook drives UI indicators (offline banner)

### Routing
- React Router v7 with 4 routes:
  - `/` → TasksPage (inbox)
  - `/task/:id` → TaskDetailPage
  - `/project/:id` → ProjectPage
  - `/setup` → SetupPage
- Auth guard redirects to `/setup` when no credentials stored

## Complexity Tracking

No constitution violations. The project stays within all declared principles.

<!-- Sync Impact Report
  Version change: N/A → 1.0.0
  Added principles: Mobile-First, API-Only Client, Simplicity, Type Safety, PWA-Native
  Added sections: Technology Stack, Development Workflow
  Templates requiring updates: ✅ constitution.md
  Follow-up TODOs: None
-->

# TaskTrove UI Constitution

## Core Principles

### I. Mobile-First
Every screen, component, and interaction MUST be designed for mobile viewports
first (≤ 428px). Desktop/tablet layouts are progressive enhancements, not the
baseline. Touch targets MUST be at least 44×44px. Navigation MUST follow a
one-screen-at-a-time pattern — no multi-panel desktop layouts in v1.

### II. API-Only Client
This project is a pure front-end client. It MUST NOT include any server-side
logic, database access, or backend code. All data flows through the TaskTrove
REST API (`/api/v1`). The API base URL and auth token MUST be configurable at
runtime (not baked into builds). All API interactions MUST go through a single
typed client layer — no scattered `fetch` calls in components.

### III. Simplicity Over Features
Start with the minimum viable screen set. Every new screen or feature MUST
justify its existence by solving a clear user pain point with the existing
TaskTrove UI (which the user finds "too busy"). When in doubt, leave it out.
Prefer fewer, well-polished interactions over many half-finished features.
YAGNI applies aggressively.

### IV. Type Safety
TypeScript strict mode MUST be enabled. No `any` types. All API
request/response shapes MUST be typed. Use Zod schemas for runtime validation
of API responses at the boundary. Generate TypeScript types from Zod schemas
via `z.infer<>`. Branded ID types (TaskId, ProjectId, etc.) SHOULD be used to
match the upstream TaskTrove type system.

### V. PWA-Native Experience
The app MUST be installable as a Progressive Web App on iOS and Android home
screens. It MUST include a web app manifest, appropriate icons, and a service
worker for offline caching of static assets. The app SHOULD function gracefully
when offline (show cached data, queue mutations for retry).

## Technology Stack

- **Runtime**: React 19 + TypeScript (strict)
- **Build**: Vite 6
- **Styling**: TailwindCSS v4, mobile-first utilities
- **State**: TanStack Query v5 (server state), React Context (UI state)
- **Routing**: React Router v7
- **Validation**: Zod for API response validation
- **PWA**: vite-plugin-pwa (Workbox)
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library

Dependencies MUST be kept minimal. No component library (shadcn, MUI, etc.) in
v1 — build lean custom components with Tailwind. Add libraries only when the
alternative is substantial hand-rolled complexity.

## Development Workflow

- **Branch strategy**: Feature branches off `main`, squash-merge PRs
- **Commit messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Pre-commit**: Lint + type-check MUST pass before commit
- **Testing**: Vitest for unit/integration tests; test API client layer and
  critical user flows; coverage targets are advisory, not blocking in v1
- **Spec-driven**: Use spec-kit artifacts (constitution, spec, plan, tasks)
  as the source of truth for feature scope and architecture decisions

## Governance

This constitution is the highest-authority document for architectural and
design decisions in this project. All code changes MUST comply with these
principles. Amendments require updating this file, incrementing the version,
and documenting the rationale in the Sync Impact Report comment block above.

**Version**: 1.0.0 | **Ratified**: 2026-04-09 | **Last Amended**: 2026-04-09

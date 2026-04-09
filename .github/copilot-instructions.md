# Copilot Instructions for TaskTrove UI

## What This Project Is

A mobile-first Progressive Web App (PWA) that serves as an alternative
front-end for the [TaskTrove](https://github.com/dohsimpson/TaskTrove)
self-hosted task management system. This is a **pure front-end client** — all
data comes from the TaskTrove REST API v1. There is no backend code here.

## Build, Test, and Lint

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npm run typecheck    # TypeScript strict type checking
npm run lint         # ESLint
npm test             # Run all tests with Vitest
npm run test:watch   # Watch mode for tests

# Run a single test file
npx vitest run tests/api/client.test.ts

# Run tests matching a pattern
npx vitest run -t "should inject auth header"
```

## Architecture

### API Layer (`src/api/`)
- `client.ts` — Base fetch client factory: `createApiClient(baseUrl, token)`
  injects Authorization header and validates responses with Zod schemas.
- `tasks.ts`, `projects.ts`, `labels.ts` — Typed CRUD functions per entity.
- **All API interactions go through this layer.** Never call `fetch()` directly
  in components.

### Type System (`src/lib/`)
- `schemas.ts` — Zod schemas for every API response shape. This is the
  single source of truth for data shapes.
- `types.ts` — TypeScript types generated via `z.infer<>` from schemas.
  Never define API types manually.
- `config.ts` — Runtime config (API base URL, token) from localStorage.
- `utils.ts` — Pure helper functions (date formatting, task grouping).

### State Management
- **Server state**: TanStack Query v5 handles fetching, caching, optimistic
  updates, and offline persistence (`persistQueryClient` to localStorage).
- **Auth state**: React Context + localStorage in `src/hooks/useAuth.ts`.
- **UI state**: React local state only — no global store.

### Components (`src/components/`)
- Grouped by feature: `tasks/`, `auth/`, `projects/`, `layout/`, `ui/`.
- `ui/` contains shared primitives (Button, Input, Checkbox, PriorityBadge).
- No component library (shadcn, MUI, etc.) — custom Tailwind components.
- All components use named exports, no default exports.

### Pages (`src/pages/`)
- 4 routes: `/` (inbox), `/task/:id` (detail), `/project/:id` (filter),
  `/setup` (auth).
- Auth guard redirects to `/setup` when no credentials are stored.

### PWA
- `vite-plugin-pwa` generates the service worker and injects the manifest.
- Config is in `vite.config.ts` under the `VitePWA()` plugin.
- Icons in `public/icons/`, manifest in `public/manifest.json`.

## Key Conventions

### TaskTrove API
- **Base URL**: Configurable at runtime (stored in localStorage). Default:
  `https://todo.denicolafamily.com`
- **Auth**: Bearer token in `Authorization` header. Optional depending on
  server config (`AUTH_SECRET` env var).
- **Endpoints**: All under `/api/v1` — tasks, projects, labels, groups.
- **API docs**: https://developer.tasktrove.io/api/
- **IDs are branded UUIDs**: The API uses strict UUID v4 format with
  specific version/variant bits. Use `crypto.randomUUID()` for new IDs.

### Mobile-First
- Design for ≤428px viewport first. Desktop is a progressive enhancement.
- Touch targets MUST be ≥44×44px.
- Text inputs MUST have `font-size: 16px` or larger to prevent iOS zoom.
- One-screen-at-a-time navigation — no side-by-side panels.

### TypeScript
- Strict mode enabled. No `any` types.
- Zod schemas are the source of truth — use `z.infer<>` for types.
- Validate API responses at the boundary (in the API client layer).

### Optimistic Updates
- Task completion uses optimistic UI updates via TanStack Query mutations.
- On server error, roll back the optimistic change and show an error toast.

## Spec-Driven Development

This project uses [GitHub Spec Kit](https://github.com/github/spec-kit).
Key artifacts:

- `.specify/memory/constitution.md` — Core principles and governance
- `specs/001-mobile-pwa-ui/spec.md` — Feature specification with user stories
- `specs/001-mobile-pwa-ui/plan.md` — Technical implementation plan
- `specs/001-mobile-pwa-ui/tasks.md` — Granular task breakdown

Copilot agents for spec-kit commands are in `.github/agents/` and can be
invoked via VS Code Copilot Chat:
`/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`,
`/speckit.implement`

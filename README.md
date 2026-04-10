# TaskTrove Mobile UI

A clean, minimal mobile-first PWA for [TaskTrove](https://github.com/dohsimpson/TaskTrove) — the self-hosted task manager.

## Features

- **Due Today** — Tasks due today and overdue, sorted by priority, with today's date in the title bar
- **Upcoming** — Future tasks grouped by day, sorted by priority within each day
- **Quick Add** — Bottom sheet with today's date default, "me" project default, and multi-label picker
- **Expandable Tasks** — Tap to reveal project, all labels, and subtasks in a detail card
- **Search** — Full-text search across all tasks
- **Completed** — Browse and un-complete finished tasks
- **Pull to Refresh** — Swipe down on any page to refresh from the server
- **Dark Mode** — Light, Dark, or System theme with full dark variant coverage
- **Font Size** — Small, Medium, Large, or XL — scales the entire UI via root font size
- **PWA** — Installable, offline-capable, with custom gem+checkmark app icon
- **Hamburger Menu** — Settings and Sign Out accessible from the title bar

## Tech Stack

React 19 · Vite 6 · TailwindCSS v4 · TanStack Query v5 · React Router v7 · Zod · vite-plugin-pwa

## Development

```bash
npm install
npm run dev          # Start dev server (http://localhost:5173)
npm test             # Run tests (74 tests across 9 suites)
npm run typecheck    # TypeScript strict checks
npm run lint         # ESLint
npm run build        # Production build
```

### Dev Proxy

During development, API requests to `/api/*` are proxied to `https://todo.denicolafamily.com` by default. To proxy to a different instance, update `vite.config.ts`:

```ts
// vite.config.ts → server.proxy
'/api': {
  target: 'https://todo.yourdomain.com',
  changeOrigin: true,
  secure: true,
}
```

Then use `http://localhost:5173` as the Server URL in the setup screen.

## Production Deployment

### Docker (Recommended)

The project includes a `Dockerfile` that builds the PWA and serves it via Caddy with a built-in reverse proxy to the TaskTrove API.

**Image**: `bjd145/tasktrove-mobile-ui` (auto-built via GitHub Actions on push to `main`)

```yaml
services:
  tasktrove-ui:
    image: bjd145/tasktrove-mobile-ui:main
    container_name: tasktrove-ui
    restart: unless-stopped
    ports:
      - "8601:80"
    environment:
      - TASKTROVE_BACKEND=tasktrove:3000
    networks:
      - tasktrove-net

  tasktrove:
    image: ghcr.io/dohsimpson/tasktrove-pro:latest
    container_name: tasktrove
    restart: unless-stopped
    environment:
      - AUTH_SECRET=your-secret-here
    volumes:
      - ./data:/app/data
    ports:
      - "8500:3000"
    networks:
      - tasktrove-net

networks:
  tasktrove-net:
```

**Environment variables for the UI container:**

| Variable | Default | Description |
|---|---|---|
| `TASKTROVE_BACKEND` | `localhost:8080` | Internal address of the TaskTrove API (container name + port) |

After deploying, enter `http://<your-server-ip>:8601` as the Server URL in the PWA setup screen.

### Manual Reverse Proxy

The built PWA (`dist/`) must be served from the **same origin** as the TaskTrove API to avoid CORS issues. Use any reverse proxy (Caddy, Nginx, Traefik) to serve static files and proxy `/api/*` to the TaskTrove backend.

**Caddy example:**

```caddyfile
:80 {
    handle /api/* {
        reverse_proxy tasktrove:3000
    }
    handle {
        root * /srv/tasktrove-ui/dist
        try_files {path} /index.html
        file_server
    }
}
```

### Why Same-Origin?

TaskTrove validates request origins — cross-origin requests from a different domain will be rejected with `INVALID_ORIGIN` (403). Serving both UI and API from the same domain avoids CORS entirely.

## CI/CD

GitHub Actions workflow (`.github/workflows/docker.yml`) runs on every push to `main`:

1. **Test** — `npm ci` → typecheck → lint → test → build
2. **Docker** — Multi-arch build (amd64/arm64), push to Docker Hub

Required repository secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

## Project Structure

```
src/
├── api/          # Typed API client + endpoint functions
├── components/   # React components
│   ├── auth/     # SetupScreen
│   ├── layout/   # AppShell, BottomNav, HamburgerMenu, PullToRefresh, OfflineBanner
│   ├── tasks/    # TaskItemExpandable, TaskList, TaskDetail, QuickAdd, EmptyState
│   └── ui/       # Button, Input, Checkbox, PriorityBadge
├── hooks/        # Custom hooks (useAuth, useTasks, useProjects, useLabels, useTheme, useOnlineStatus)
├── lib/          # Zod schemas, types, utils, config
├── pages/        # TasksPage, UpcomingPage, SearchPage, CompletedPage, SettingsPage, TaskDetailPage, ProjectPage, SetupPage
├── App.tsx       # Router + providers + auth guard
└── main.tsx      # Entry point
```

## License

MIT

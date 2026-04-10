# TaskTrove Mobile UI

A clean, minimal mobile-first PWA for [TaskTrove](https://github.com/dohsimpson/TaskTrove) — the self-hosted task manager.

## Tech Stack

React 19 · Vite 6 · TailwindCSS v4 · TanStack Query v5 · React Router v7 · Zod · vite-plugin-pwa

## Development

```bash
npm install
npm run dev          # Start dev server (http://localhost:5173)
npm test             # Run tests
npm run typecheck    # TypeScript strict checks
npm run lint         # ESLint
npm run build        # Production build
```

### Dev Proxy

During development, API requests to `/api/*` are proxied to `http://localhost:3000` (default TaskTrove port). To proxy to a remote instance:

```ts
// vite.config.ts → server.proxy
'/api': {
  target: 'https://todo.yourdomain.com',
  changeOrigin: true,
  secure: true,
}
```

Then use `http://localhost:5173` as the Server URL in the setup screen (or enter the full remote URL if connecting directly).

## Production Deployment

The built PWA is a static site (`dist/`). It must be served from the **same origin** as the TaskTrove API to avoid CORS issues. Use a reverse proxy to colocate both.

### Option A: Caddy (recommended)

```caddyfile
todo.yourdomain.com {
    # API → TaskTrove container
    handle /api/* {
        reverse_proxy tasktrove:3000
    }

    # Everything else → PWA static files
    handle {
        root * /srv/tasktrove-ui/dist
        try_files {path} /index.html
        file_server
    }
}
```

### Option B: Nginx

```nginx
server {
    listen 443 ssl;
    server_name todo.yourdomain.com;

    # API → TaskTrove container
    location /api/ {
        proxy_pass http://tasktrove:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # PWA static files
    location / {
        root /srv/tasktrove-ui/dist;
        try_files $uri /index.html;
    }
}
```

### Option C: Docker Compose

```yaml
services:
  tasktrove:
    image: ghcr.io/dohsimpson/tasktrove:latest
    volumes:
      - ./data:/app/data
    environment:
      - AUTH_SECRET=your-secret-here

  caddy:
    image: caddy:2-alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./tasktrove-ui/dist:/srv/tasktrove-ui/dist
      - caddy_data:/data

volumes:
  caddy_data:
```

### Option D: Portainer Stack

Import this as a **Stack** in Portainer (Stacks → Add stack → Web editor):

```yaml
version: "3.8"

services:
  tasktrove:
    image: ghcr.io/dohsimpson/tasktrove:latest
    restart: unless-stopped
    volumes:
      - tasktrove_data:/app/data
    environment:
      - AUTH_SECRET=your-secret-here
    labels:
      - com.centurylinklabs.watchtower.enable=true

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - tasktrove_ui:/srv/tasktrove-ui/dist:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - tasktrove

volumes:
  tasktrove_data:
  tasktrove_ui:
  caddy_data:
  caddy_config:
```

**Portainer setup steps:**

1. Create the stack in Portainer (Stacks → Add stack)
2. Paste the YAML above and deploy
3. Upload your `Caddyfile` (Option A config) to the Caddy container at `/etc/caddy/Caddyfile`, or bind-mount it from the host
4. Copy your built `dist/` folder into the `tasktrove_ui` volume:
   ```bash
   # From your build machine
   npm run build
   docker cp dist/. <caddy-container-name>:/srv/tasktrove-ui/dist/
   ```
5. Restart the Caddy service from the Portainer UI

> **Tip:** Use Portainer's **Environment variables** section to set `AUTH_SECRET` instead of hardcoding it in the YAML. You can also configure Portainer webhooks to auto-redeploy when you push a new image.

### Why Same-Origin?

TaskTrove validates request origins — cross-origin requests from a different domain will be rejected with `INVALID_ORIGIN` (403). Serving both UI and API from the same domain avoids CORS entirely and ensures HTTPS works seamlessly.

> **CORS Note:** If you must host the PWA on a different domain, TaskTrove would need an `ALLOWED_ORIGINS` environment variable to whitelist your PWA domain. As of now, TaskTrove does not expose this setting — same-origin deployment (reverse proxy) is the only supported approach.

## Project Structure

```
src/
├── api/          # Typed API client + endpoint functions
├── components/   # React components (auth, layout, tasks, ui)
│   ├── auth/     # SetupScreen
│   ├── layout/   # AppShell, BottomNav, OfflineBanner
│   ├── tasks/    # TaskItem, TaskList, TaskDetail, QuickAdd, EmptyState
│   └── ui/       # Button, Input, Checkbox, PriorityBadge
├── hooks/        # Custom hooks (auth, tasks, projects, labels, online)
├── lib/          # Zod schemas, types, utils, config
├── pages/        # Route page components
├── App.tsx       # Router + providers + auth guard
└── main.tsx      # Entry point
```

## License

MIT

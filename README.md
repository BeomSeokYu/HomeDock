# HomeDock

HomeDock is a sleek home-server launcher that turns ports and subdomains into a clean, categorized dashboard.
It ships as a Next.js + NestJS monorepo and runs well on Linux/ARM with Docker Compose.
This repo uses pnpm workspaces.

## Features
- Category-driven service cards with icon, name, and URL/port
- Auth-required access for external exposure
- Database-backed configuration (SQLite by default)
- Docker Compose deploy target + GitHub Actions CI

## Requirements
- Node.js 18+ (Next 16 / Nest 11)
- pnpm 9+ (via Corepack)
- Docker (optional, for compose deployment)

## Quickstart (Docker)
1. Copy `.env.example` to `.env` and set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET`.
   - Set `WEB_ORIGIN` to your external domain if exposing publicly.
   - Set `NEXT_PUBLIC_API_BASE_URL` to your public API URL (rebuild required if it changes).
2. Build and run:

```bash
docker compose up --build
```

3. Open `http://localhost:3000`.

## Local dev
```bash
pnpm install
pnpm dev
```

Run separately if needed:
```bash
pnpm dev:web
pnpm dev:api
```

Default ports: web `:3000`, API `:4000`.

## API
- `POST /api/auth/login` -> JWT access token
- `GET /api/auth/me` -> current user
- `GET /api/categories` -> categories with services (auth required)
- `POST /api/categories` -> create category (auth required)
- `GET /api/services` -> services (auth required)
- `POST /api/services` -> create service (auth required)

## Notes
- SQLite is stored at `/data/homedock.db` inside the API container.
- CORS uses `WEB_ORIGIN`. Set it for your external domain.
- `NEXT_PUBLIC_API_BASE_URL` is baked into the web build. Rebuild the web image when changing domains.
- Set a strong `JWT_SECRET` before exposing HomeDock publicly.

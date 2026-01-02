# HomeDock

HomeDock is a sleek server launcher that turns ports and subdomains into a clean, categorized dashboard.
It is a Next.js + NestJS monorepo with a SQLite-backed configuration, designed for Linux/ARM and Docker Compose.

한국어 문서: `README.ko.md`

## Features
- Public dashboard with category cards, square service tiles, and a favorites dock.
- Admin-only settings modal for brand/title/description, layout columns, and categories/services.
- Weather via Open-Meteo (IP auto-location + manual search), with configurable metadata rows.
- System summary card with configurable fields and order.
- Built-in i18n: Korean, English, Japanese, Chinese.

## Requirements
- Node.js 18+
- pnpm 9+ (via Corepack)
- Docker (optional, for Compose deployment)

## Quickstart (Docker)
1. Clone and enter the repo:

```bash
git clone https://github.com/BeomSeokYu/HomeDock.git
cd HomeDock
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Edit `.env` and set:
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`
   - `WEB_ORIGIN` (CORS allowlist)
   - `NEXT_PUBLIC_API_BASE_URL` (baked into the web build)
   - Optional: `API_PORT`, `WEB_PORT` if you want custom ports

4. Build and run:

```bash
docker compose up --build -d
```

5. Open `http://localhost:3000`.

## Local Development
```bash
corepack enable
pnpm install
pnpm db:migrate
pnpm dev
```

Run separately if needed:
```bash
pnpm dev:web
pnpm dev:api
```

Default ports: web `:3000`, API `:4000`.

## API Endpoints
- `POST /api/auth/login` -> JWT access token
- `GET /api/auth/me` -> current user
- `GET /api/dashboard` -> public dashboard data
- `GET /api/dashboard/admin` -> admin dashboard data (auth)
- `PUT /api/dashboard/admin` -> update config + categories (auth)
- `GET /api/weather` -> current weather + daily data
- `GET /api/weather/locations?query=...` -> location search

## Notes
- Docker Compose stores SQLite at `./homedock-data/homedock.db` on the host.
- Admin credentials are synced from `.env` on API boot (email + password updates).
- `NEXT_PUBLIC_API_BASE_URL` is baked into the web build; rebuild when it changes.

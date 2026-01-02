# Repository Guidelines

## Project Structure & Module Organization
- `apps/web`: Next.js App Router frontend. Main UI lives in `apps/web/app/page.tsx` with styling in `apps/web/app/globals.css`.
- `apps/api`: NestJS backend modules under `apps/api/src`, Prisma schema in `apps/api/prisma/schema.prisma`.
- `packages/types`: Shared TypeScript types used by web and API.
- Root configs: `docker-compose.yml`, `.env.example`, `pnpm-workspace.yaml`, `tsconfig.base.json`.

## Build, Test, and Development Commands
- `pnpm install`: Install workspace dependencies.
- `pnpm dev`: Run web and API in parallel (default ports `:3000` and `:4000`).
- `pnpm dev:web`: Run Next.js dev server only.
- `pnpm dev:api`: Run NestJS dev server only (includes Prisma generate).
- `pnpm build`: Build web and API.
- `pnpm db:migrate`: Apply Prisma schema to the SQLite database.
- `docker compose up --build`: Build and run containers locally.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; TypeScript with semicolons.
- Naming: `camelCase` for variables/functions, `PascalCase` for types/classes, `kebab-case` for new file names.
- Keep web UI text in the `TRANSLATIONS` map (`apps/web/app/page.tsx`) and reuse `t(...)` helpers.
- Dashboard order fields (`systemSummaryOrder`, `weatherMetaOrder`) are stored as JSON strings in SQLite; use the parse/serialize helpers in `apps/api/src/dashboard/dashboard.service.ts` when editing.

## Testing Guidelines
- Tests are not set up yet.
- If adding tests, prefer:
  - Web: React Testing Library or Playwright.
  - API: Jest with `@nestjs/testing`.
- Name tests `*.spec.ts` and place them alongside modules.

## Commit & Pull Request Guidelines
- Commit history uses Conventional Commits (e.g., `feat:`, `chore:`, `docs:`).
- PRs should include:
  - A clear summary and linked issue (if applicable).
  - UI screenshots for `apps/web` changes.
  - Notes on DB/schema changes (`apps/api/prisma`).

## Security & Configuration Tips
- `.env` is loaded from the repo root or `apps/api` via `ConfigModule`.
- Set strong values for `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
- `NEXT_PUBLIC_API_BASE_URL` is baked into the web build; rebuild when it changes.

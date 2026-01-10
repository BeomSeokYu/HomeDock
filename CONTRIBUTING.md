# Contributing to HomeDock

Thanks for taking the time to contribute. This guide explains how to set up the
project and what we expect in pull requests.

## Code of Conduct
By participating, you agree to abide by the Code of Conduct in
CODE_OF_CONDUCT.md.

## Getting Started
Prerequisites:
- Node.js 20+
- pnpm 9+ (via Corepack)
- Docker (optional, for Compose deployment)

Setup:
1. Fork and clone the repository.
2. Copy the environment template: `cp .env.example .env`
3. Install dependencies:
   `corepack enable`
   `pnpm install`
4. Apply Prisma schema to SQLite:
   `pnpm db:migrate`
5. Run development servers:
   `pnpm dev`

Run separately if needed:
- `pnpm dev:web`
- `pnpm dev:api`

## Linting
- `pnpm lint`

## Tests
- `pnpm test`

## Project Notes
- UI text should live in the `TRANSLATIONS` map in `apps/web/app/page.tsx`.
- Dashboard order fields (`systemSummaryOrder`, `weatherMetaOrder`) are stored as
  JSON strings in SQLite; use parse/serialize helpers in
  `apps/api/src/dashboard/dashboard.service.ts` when editing.
- Dynamic OG/icon routes use the Next.js edge runtime; build warnings about edge
  runtime are expected when those routes are enabled.

## Commit Messages
We use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`).

## Pull Requests
Please include:
- A clear summary of what changed and why.
- Screenshots for UI changes under `apps/web`.
- Notes about DB or schema changes (`apps/api/prisma`).

## Issues
If you find a bug or have a feature request, please open an issue using the
provided templates.

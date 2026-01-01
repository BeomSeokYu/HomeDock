# Repository Guidelines

## Project Structure & Module Organization
- `apps/web`: Next.js App Router frontend (`app/` for routes, `public/` for assets).
- `apps/api`: NestJS backend (`src/` for modules/controllers, `prisma/` for schema).
- `packages/types`: Shared TypeScript types for web/api.
- `ref/`: Visual reference files used for styling direction.
- Root configs: `docker-compose.yml`, `.env.example`, `tsconfig.base.json`.

## Build, Test, and Development Commands
- `pnpm install`: Install workspace dependencies.
- `pnpm dev`: Run web and API in parallel (Next.js on `:3000`, NestJS on `:4000`).
- `pnpm dev:web`: Start Next.js dev server on `:3000`.
- `pnpm dev:api`: Start NestJS API with watch mode on `:4000`.
- `pnpm --filter @homedock/web build`: Build the web app for production.
- `pnpm --filter @homedock/api build`: Build the API and generate Prisma client.
- `docker compose up --build`: Build and run web/api containers locally.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; TypeScript with semicolons.
- Naming: `camelCase` for variables/functions, `PascalCase` for types/classes, `kebab-case` for file names when introducing new ones.
- Keep React components functional and colocate styles in `apps/web/app/globals.css` unless a new CSS module is justified.

## Testing Guidelines
- Tests are not configured yet. If you add tests, prefer:
  - Web: Playwright or React Testing Library.
  - API: Jest with `@nestjs/testing`.
- Name tests with `.spec.ts` and co-locate under module folders (e.g., `apps/api/src/auth/auth.service.spec.ts`).

## Commit & Pull Request Guidelines
- No commit history is present. Use Conventional Commits (e.g., `feat: add service editor`).
- PRs should include:
  - Clear summary and linked issue (if applicable).
  - Screenshots for UI changes (`apps/web`).
  - Notes on API changes and migration impact (`apps/api/prisma`).

## Security & Configuration Tips
- Set strong values in `.env` for `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
- `NEXT_PUBLIC_API_BASE_URL` is baked into the web build; rebuild when changing domains.

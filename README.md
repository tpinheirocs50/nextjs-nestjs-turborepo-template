# Next.js + NestJS Monorepo Template

A production-ready monorepo template with **Next.js 16**, **NestJS 11**, **Prisma 7 + PostgreSQL**, **Turborepo**, and **pnpm workspaces**. Includes a working end-to-end example with shared TypeScript types and a real database query path between frontend and backend.

## What's inside

```
.
├── apps/
│   ├── web/              # Next.js 16 (App Router, Turbopack, validated env)
│   └── api/              # NestJS 11 (Prisma 7 + Postgres, validated env)
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── docker-compose.yml    # Local Postgres for development
├── turbo.json            # Turborepo task pipeline
└── pnpm-workspace.yaml   # pnpm workspace config
```

### Tech stack

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router and Turbopack
- **[NestJS 11](https://nestjs.com/)** — Progressive Node.js framework for the API
- **[Prisma 7](https://www.prisma.io/)** — Type-safe database ORM with the new Rust-free client
- **[PostgreSQL 17](https://www.postgresql.org/)** — Database, run locally via Docker
- **[Turborepo 2.9](https://turborepo.dev/)** — Build system with intelligent caching
- **[pnpm](https://pnpm.io/) workspaces** — Fast, disk-efficient package manager
- **TypeScript 5.9** — Shared across all packages
- **Zod-validated env** — Both apps fail fast if their environment is misconfigured

## Prerequisites

- **Node.js 20 LTS** or newer (an `.nvmrc` file is included — run `nvm use`)
- **pnpm 9** or newer (`npm install -g pnpm`)
- **Docker** with Docker Compose v2 (for the local Postgres database)

## Quick start

```bash
# Install dependencies
pnpm install

# Copy env example files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start the database
pnpm db:up

# Run migrations and seed initial data
pnpm --filter api db:migrate
pnpm --filter api db:seed

# Start both apps in development mode
pnpm dev
```

This launches:

- Next.js on [http://localhost:3000](http://localhost:3000)
- NestJS on [http://localhost:3001](http://localhost:3001)
- Postgres on `localhost:5432` (in Docker)

Open [http://localhost:3000](http://localhost:3000) — you'll see the web app calling the API. Hit [http://localhost:3001/users](http://localhost:3001/users) directly to see Prisma returning the seeded demo user from Postgres.

## Scripts

All scripts run from the repo root and operate across the workspace via Turborepo.

| Command | Description |
| --- | --- |
| `pnpm dev` | Run all apps in development mode (with hot reload) |
| `pnpm build` | Build all apps and packages for production |
| `pnpm lint` | Lint all apps |
| `pnpm type-check` | Type-check all packages |
| `pnpm test` | Run tests across the workspace |
| `pnpm verify` | Clean install + build + lint + type-check (use this in CI) |
| `pnpm db:up` | Start the local Postgres database (Docker) |
| `pnpm db:down` | Stop the database (data persists) |
| `pnpm db:reset` | Destroy and recreate the database (fresh start) |
| `pnpm --filter api db:migrate` | Apply migrations and regenerate the Prisma client |
| `pnpm --filter api db:seed` | Insert demo data |
| `pnpm --filter api db:studio` | Launch Prisma Studio to browse the database |

Run a script in a specific package only:

```bash
pnpm --filter web dev
pnpm --filter api test
```

## Environment variables

Both apps validate their environment variables at startup using [Zod](https://zod.dev/). If a required variable is missing or malformed, the app fails fast with a clear error message instead of crashing later at runtime.

Example files are committed to the repo:

- `apps/api/.env.example`
- `apps/web/.env.example`

Copy each one to a sibling `.env` file and adjust as needed:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Sensible defaults are baked into the Zod schemas, so most apps run with no edits to `.env` in development. The exception is `DATABASE_URL` — there's no sensible fallback for a database, so it's required.

### Adding a new env var

1. Add it to the relevant `.env.example` file with a sensible default or placeholder
2. Add it to the Zod schema in `apps/<app>/src/env.ts`
3. Add the variable name to the `env` array in `turbo.json` so the build cache invalidates when its value changes
4. Use it via `import { env } from "./env"` instead of `process.env`

For the **web** app, prefix browser-visible vars with `NEXT_PUBLIC_` and add them to the client schema. Server-only vars go in the server schema.

## Database

The api uses **Prisma 7** with a local **PostgreSQL 17** instance running in Docker.

### Schema location

The Prisma schema, migrations, and config live inside the api app:

- `apps/api/prisma/schema.prisma` — data models
- `apps/api/prisma/migrations/` — generated migration files
- `apps/api/prisma.config.ts` — Prisma CLI config (replaces the old `package.json` block)

### Workflow

```bash
# Edit apps/api/prisma/schema.prisma, then:
pnpm --filter api db:migrate
```

This creates a new migration, applies it to your local database, and regenerates the typed Prisma client. The client is regenerated automatically on every `pnpm install` via a postinstall hook.

### Architecture note

Prisma is colocated with the api rather than living in a separate workspace package. This is intentional: with Prisma 7's new Rust-free client, in-app colocation avoids cross-package compilation friction and matches the official NestJS + Prisma pattern. If you ever need to share Prisma across multiple services, extract it into `packages/database` at that point.

### Adding tables to the schema

1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm --filter api db:migrate` — Prisma will prompt for a migration name
3. Use the new model in NestJS by injecting `PrismaService`:

```typescript
@Injectable()
export class MyService {
  constructor(private readonly prisma: PrismaService) {}
}
```

## How the shared types work

`packages/shared-types` exports TypeScript interfaces consumed by both the web and api apps. This guarantees the frontend and backend stay in sync on the shape of API responses and DTOs.

```typescript
// packages/shared-types/src/index.ts
export interface HealthCheck {
  status: "ok";
  timestamp: string;
}
```

The NestJS controller returns it:

```typescript
// apps/api/src/app.controller.ts
@Get("health")
getHealth(): HealthCheck {
  return { status: "ok", timestamp: new Date().toISOString() };
}
```

The Next.js page consumes it:

```typescript
// apps/web/src/app/page.tsx
import type { HealthCheck } from "@repo/shared-types";

const res = await fetch("http://localhost:3001/health");
const health: HealthCheck = await res.json();
```

Change a field in `shared-types`, and TypeScript will flag it across both apps.

## Adding a new shared package

```bash
mkdir -p packages/my-package/src
cd packages/my-package
pnpm init
```

Set the package name to `@repo/my-package` and add a basic `tsconfig.json`. Then from the root, install it into whichever app needs it:

```bash
pnpm add @repo/my-package --filter web --workspace
```

If you're consuming it from a Next.js app, remember to add the package name to `transpilePackages` in `next.config.ts`.

## Turborepo caching

Turborepo caches the output of `build`, `lint`, `type-check`, and `test` based on file content. Re-running a task with no changes is near-instant.

To enable **remote caching** (free for repos linked to Vercel):

```bash
pnpm dlx turbo login
pnpm dlx turbo link
```

After linking, all team members and CI runs share the same cache.

## Project structure conventions

- **`apps/`** — Deployable applications. Each app has its own `package.json` and runs independently.
- **`packages/`** — Internal libraries shared across apps. Names use the `@repo/` prefix.
- **Workspace dependencies** are declared with `"@repo/foo": "workspace:^"` in `package.json`.

## CI

A minimal GitHub Actions workflow is included at `.github/workflows/ci.yml`. It runs `pnpm verify` on every push and pull request.

For CI speed, consider enabling Turborepo Remote Cache (see above) — it can reduce CI build times by 50–90% on cache hits.

## Production deployment

Each app deploys independently:

- **Web (Next.js)** — Deploy `apps/web` to Vercel, Netlify, or any Node.js host. Set the build command to `pnpm turbo run build --filter=web` and the install command to `pnpm install --frozen-lockfile`.
- **API (NestJS)** — Build with `pnpm turbo run build --filter=api`, then run `node apps/api/dist/main.js`. Containerize with Docker, or deploy to Railway, Render, Fly.io, etc. The API expects a managed Postgres instance in production; set `DATABASE_URL` to your provider's connection string.

## Common tasks

### Update dependencies

```bash
pnpm update -r --interactive --latest
```

### Clean all build artifacts and `node_modules`

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf .turbo apps/*/.turbo apps/web/.next apps/api/dist
```

### Reset the database from scratch

```bash
pnpm db:reset
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

### Run only what changed since main

```bash
pnpm turbo run build --filter=...[origin/main]
```

This is the killer feature for CI — only rebuilds packages affected by your changes.

## Troubleshooting

**`Can't reach database server` from Prisma or psql, even though Docker says Postgres is healthy.**
Check whether you have a VPN or proxy running (Cloudflare WARP, NordVPN, ZeroTrust agents). These often reroute `localhost` traffic and break local Docker connections silently. Disable for local dev or exclude `localhost` / `127.0.0.1`.

**Type errors in `apps/api/src/prisma/generated/`.**
The generated client is regenerated automatically on `pnpm install` (via the api's `postinstall` hook). If types still look wrong, regenerate manually with `pnpm --filter api db:generate`.

## License

MIT

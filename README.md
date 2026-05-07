# Next.js + NestJS Monorepo Template

A production-ready monorepo template with **Next.js 16**, **NestJS 11**, **Prisma 7 + PostgreSQL**, **Better Auth**, **Turborepo**, and **pnpm workspaces**. Includes a working end-to-end example with shared TypeScript types, structured logging, a typed API client, email/password and Google OAuth authentication, and production Dockerfiles for both apps.

## What's inside

```
.
├── apps/
│   ├── web/              # Next.js 16 (App Router, Turbopack, validated env)
│   └── api/              # NestJS 11 (Prisma 7 + Postgres, validated env, Pino logging)
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── api-client/       # Typed HTTP client for the API
├── apps/api/Dockerfile   # Multi-stage production image for the api
├── apps/web/Dockerfile   # Multi-stage production image for the web app
├── docker-compose.yml    # Orchestrates Postgres, migrations, api, and web
├── turbo.json            # Turborepo task pipeline
└── pnpm-workspace.yaml   # pnpm workspace config
```

### Tech stack

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router and Turbopack
- **[NestJS 11](https://nestjs.com/)** — Progressive Node.js framework for the API
- **[Prisma 7](https://www.prisma.io/)** — Type-safe database ORM with the new Rust-free client
- **[PostgreSQL 17](https://www.postgresql.org/)** — Database, run locally via Docker
- **[Pino](https://getpino.io/) logging** — Structured JSON logs in production, pretty-printed in dev, request context auto-attached
- **Typed API client** — End-to-end type safety between web and api via a shared client package, no manual fetch
- **[Better Auth](https://better-auth.com/)** — Email/password authentication with secure cookie sessions, password hashing, and Prisma-backed user storage
- **[Turborepo 2.9](https://turborepo.dev/)** — Build system with intelligent caching
- **[pnpm](https://pnpm.io/) workspaces** — Fast, disk-efficient package manager
- **TypeScript 5.9** — Shared across all packages
- **Zod-validated env** — Both apps fail fast if their environment is misconfigured
- **Production Dockerfiles** — Multi-stage builds for both apps, orchestrated via Compose

## Prerequisites

- **Node.js 20 LTS** or newer (an `.nvmrc` file is included — run `nvm use`)
- **pnpm 9** or newer (`npm install -g pnpm`)
- **Docker** with Docker Compose v2 (for Postgres in dev, and the full Docker workflow)

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
| `pnpm docker:build` | Build production images for api and web |
| `pnpm docker:up` | Start the full stack in Docker (Postgres + migrate + api + web) |
| `pnpm docker:up:detached` | Same as above, but run in the background |
| `pnpm docker:down` | Stop and remove all containers |
| `pnpm docker:logs` | Follow logs from all running containers |

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

The api loads `.env` files only when `NODE_ENV !== 'production'`. In production (Docker, Railway, AWS, etc.), env vars are expected to come from the host environment directly, not from a `.env` file. This keeps the production image free of dotenv as a runtime dependency.

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

## Logging

The api uses **[Pino](https://getpino.io/)** via [`nestjs-pino`](https://github.com/iamolegga/nestjs-pino) for structured logging.

### What you get

- **Pretty-printed in development** — colored, single-line output in the terminal
- **Raw JSON in production** — log aggregators (Datadog, CloudWatch, Loki, etc.) parse it natively
- **Automatic request context** — every log made during an HTTP request includes the request ID, method, URL, etc., letting you trace a single request across multiple log lines
- **Auto-logged HTTP requests** — method, URL, status code, response time, and request ID logged for every call

### Configuration

The log level is controlled by `LOG_LEVEL` in `.env`. Valid values: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent`. Default is `info`.

### Using the logger in your code

Inject `PinoLogger` into any controller or service:

```typescript
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class MyService {
  constructor(
    @InjectPinoLogger(MyService.name)
    private readonly logger: PinoLogger,
  ) {}

  doSomething() {
    this.logger.info('Plain message');
    this.logger.info({ userId: '123', action: 'login' }, 'Structured log');
    this.logger.error({ err: new Error('boom') }, 'Something went wrong');
  }
}
```

The `@InjectPinoLogger(MyService.name)` decorator pre-tags every log with `context: "MyService"`, so you can filter by source class.

## API client

The web app calls the api through a typed client package (`@repo/api-client`) instead of using raw `fetch`. This gives you end-to-end type safety, centralized error handling, and one place to configure base URLs, timeouts, and headers.

### Using it

```typescript
import { ApiError } from '@repo/api-client';
import { api } from '@/lib/api';

try {
  const users = await api.users.list();
  // users is typed as User[]
} catch (error) {
  if (error instanceof ApiError) {
    // HTTP error from the api
    console.error(error.status, error.message);
  } else {
    // Network error, timeout, etc.
    console.error('Network error', error);
  }
}
```

### Adding a new endpoint

When you add an endpoint to the NestJS api, also add it to the client so it's typed and reachable from the frontend:

1. Add the endpoint method in `packages/api-client/src/api.ts`:

```typescript
export const createApi = (client: ApiClient) => ({
  users: {
    list: () => client.get<User[]>('/users'),
    get: (id: string) => client.get<User>(`/users/${id}`),  // new
  },
});
```

2. Use it from the web app — autocomplete and types come for free:

```typescript
const user = await api.users.get('abc123');
```

### Why a client package and not tRPC

The api is a regular REST API exposed by NestJS. This means it can be consumed by any client — a future mobile app, a third-party integration, a CLI tool — not just the web app. The client package gives the web app a typed, ergonomic way to call it without locking the api into a TypeScript-only contract like tRPC would.

### Server-side vs browser URLs

The web app is configured with two separate URLs to talk to the api:

- **`NEXT_PUBLIC_API_URL`** — used by the browser. In Docker, this maps to the host's port forward (`http://localhost:3001`).
- **`INTERNAL_API_URL`** — used server-side (Server Components, Route Handlers). In Docker, this is the container-network hostname (`http://api:3001`).

`apps/web/src/lib/api.ts` checks `typeof window === 'undefined'` to decide which one to use. For local dev (`pnpm dev`), only `NEXT_PUBLIC_API_URL` is set and both contexts use the same value.

### Server Components and dynamic rendering

Pages that call the api (like `apps/web/src/app/page.tsx`) include `export const dynamic = 'force-dynamic'` so Next.js renders them on every request instead of trying to prerender at build time (which would fail because the api isn't running during the build). If your page doesn't depend on live api data, you can omit this and let Next.js prerender as usual.

## Authentication

The template ships with email/password and Google OAuth via **[Better Auth](https://better-auth.com/)**, integrated into NestJS through `@thallesp/nestjs-better-auth` and into Next.js via Better Auth's React client.

### What's included

- **Email and password** sign-up and sign-in with secure password hashing
- **Google OAuth** (optional — enabled when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set)
- **Database-backed sessions** via cookies (HTTP-only, SameSite=Lax, 7-day expiry by default)
- **Auto-sign-in on sign-up** so new users go straight to the dashboard
- **`useSession()` hook** for reactive session state in client components
- **Next.js 16 proxy** that redirects unauthenticated requests away from protected routes (e.g., `/dashboard`)
- **Global `AuthGuard`** on the api — every endpoint requires auth unless explicitly marked `@AllowAnonymous()` or `@OptionalAuth()`
- **`@Session()` decorator** for typed access to the current user inside controllers
- **Sample protected endpoint** — `GET /me` returns the current session, demonstrating server-side auth

### Configuration

Two new env vars in `apps/api/.env`:

- `BETTER_AUTH_SECRET` — required, at least 32 characters. Used for signing session tokens. Generate one with `openssl rand -base64 32`.
- `BETTER_AUTH_URL` — the public URL of the api (default `http://localhost:3001`).

The web app reaches Better Auth's endpoints via `NEXT_PUBLIC_API_URL` (already configured for the API client).

### Google OAuth setup

Google OAuth is optional. To enable it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project (or use an existing one)
2. Configure the OAuth consent screen (Google Auth platform → Overview)
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google` (and your production callback URL when applicable)
5. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `apps/api/.env`

Without these env vars, the Google provider is silently skipped and only email/password auth is available.

To add other OAuth providers (GitHub, Apple, etc.), follow the same pattern in `apps/api/src/auth/auth.config.ts` — Better Auth's `socialProviders` config accepts any of its [supported providers](https://better-auth.com/docs/concepts/oauth).

### Where things live

- `apps/api/src/auth/auth.config.ts` — runtime Better Auth config (factory taking `PrismaService`)
- `apps/api/src/auth/auth.cli.ts` — CLI-only config, used solely by `@better-auth/cli` to generate the Prisma schema. Not used at runtime.
- `apps/web/src/lib/auth-client.ts` — typed client SDK
- `apps/web/src/proxy.ts` — Next.js proxy that protects `/dashboard`
- `apps/web/src/app/sign-up/page.tsx`, `sign-in/page.tsx`, `dashboard/page.tsx` — the auth UI

### Database models

Better Auth manages four tables: `User`, `Session`, `Account`, `Verification`. They're defined in `apps/api/prisma/schema.prisma` and were generated by the Better Auth CLI.

### Adding new auth features

The template uses email/password only as the foundation. Common next steps:

- **Social OAuth (Google, GitHub, etc.)** — add a `socialProviders` block to `auth.config.ts` and matching env vars. The Better Auth client gains `signIn.social({ provider: 'google' })` automatically.
- **Email verification** — set `emailAndPassword.requireEmailVerification: true` and configure `emailVerification.sendVerificationEmail` with your transactional email provider (Resend, SendGrid, etc.).
- **Password reset** — same pattern, configure `emailAndPassword.sendResetPassword`.
- **2FA, passkeys, magic links** — Better Auth plugins. Install `@better-auth/plugins/two-factor` (or similar) and add to the `plugins` array.

Whenever you change feature flags or add plugins, mirror the change in `auth.cli.ts` and re-run `npx @better-auth/cli generate` so the Prisma schema stays in sync, then `pnpm --filter api db:migrate`.

### Server-side session checks

For API endpoints in NestJS that need the current user, use the `@Session()` decorator from `@thallesp/nestjs-better-auth`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('me')
export class MeController {
  @Get()
  async getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }
}
```

By default, the `AuthModule` registers a global guard that protects all routes. Mark routes as public with `@AllowAnonymous()` or as optional auth with `@OptionalAuth()` from the same package.

## Docker

The template includes production Dockerfiles for both apps and a `docker-compose.yml` that orchestrates the entire stack: Postgres, migrations, api, and web.

### Local development workflow (unchanged)

For day-to-day development, you run apps locally and Docker only hosts Postgres:

```bash
pnpm db:up        # Postgres in Docker
pnpm dev          # api + web running locally via Turborepo
```

### Full stack in Docker

To run the entire production-built stack in Docker (useful for testing the production environment, or as a deployment-shaped sanity check):

```bash
pnpm docker:build    # Build all images
pnpm docker:up       # Start the full stack
```

This brings up four containers in order:

1. **`postgres`** on port 5432 — waits for healthcheck before continuing
2. **`migrate`** — runs `prisma migrate deploy` against the empty database, then exits with code 0
3. **`api`** on port 3001 — starts only after `migrate` completes successfully
4. **`web`** on port 3000 — starts only after `api` is up

Open `http://localhost:3000` to see the running app.

To stop:

```bash
pnpm docker:down
```

To stop and wipe the database volume (start completely fresh):

```bash
docker compose --profile full down -v
```

### How the migrate service works

The `migrate` service is a one-shot job container — not a long-running service. It builds from the api's Dockerfile but stops at the `builder` stage (which still has the Prisma CLI), runs `prisma migrate deploy` against Postgres, and exits cleanly. The `api` service uses `depends_on: migrate: condition: service_completed_successfully` to wait until migrations finish before starting.

This pattern mirrors how production deployments handle migrations on Kubernetes (Helm hooks), AWS ECS (run-task), or platform-managed services (Railway, Fly): a dedicated migration step runs before the app containers, and the app containers refuse to start if migrations fail. The compose setup gives you the same guarantees locally.

### Image sizes

- **API**: ~404MB (~150MB Node Alpine + ~250MB Prisma 7 runtime + ~5MB app)
- **Web**: ~205MB (Node Alpine + Next.js standalone bundle)

The api image is heavier than ideal due to [Prisma 7's bloated dependency graph](https://github.com/prisma/prisma/discussions/28787) — a known upstream issue that the Prisma team has acknowledged. The Dockerfile includes a workaround that strips dev-only Prisma packages (Prisma Studio, `@prisma/dev`, etc.) post-install to claw back ~50MB. When Prisma fixes this upstream, the workaround can be removed.

### Profile-based separation

The `docker-compose.yml` uses Compose [profiles](https://docs.docker.com/compose/profiles/) so the dev workflow keeps working unchanged:

- **No profile (default)** — only Postgres runs. This is what `pnpm db:up` invokes.
- **`full` profile** — runs Postgres + migrate + api + web. This is what `pnpm docker:up` invokes via `docker compose --profile full up`.

This means you don't have to choose between "compose for dev" and "compose for production-shape testing" — one file does both.

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

The Next.js page consumes it through the api client:

```typescript
// apps/web/src/app/page.tsx
import type { HealthCheck } from "@repo/shared-types";
import { api } from "@/lib/api";

const health: HealthCheck = await api.health.get();
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

Each app has a working production Dockerfile. Two common deployment shapes:

### Container-based (Railway, Fly.io, Render, AWS ECS, Kubernetes)

```bash
docker build -f apps/api/Dockerfile -t my-api:latest .
docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t my-web:latest .
```

Push to your registry, deploy. Provide `DATABASE_URL`, `CORS_ORIGIN`, and other env vars at runtime via your platform's secret manager. Run migrations as a separate one-shot job (the `migrate` service in `docker-compose.yml` shows the pattern).

### Vercel + managed backend

- **Web** — Deploy `apps/web` to Vercel directly. Set the build command to `pnpm turbo run build --filter=web` and the install command to `pnpm install --frozen-lockfile`. No Dockerfile needed for this path.
- **API** — Deploy via Docker to Railway, Fly, Render, etc. The Dockerfile in `apps/api/Dockerfile` is ready to use.

The api expects a managed Postgres instance in production; set `DATABASE_URL` to your provider's connection string (Neon, Supabase, RDS, etc.).

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

**`fetch failed` / `ECONNREFUSED` from the web container when running the full Docker stack.**
The web app uses `NEXT_PUBLIC_API_URL` for browser calls and `INTERNAL_API_URL` for server-side calls. Make sure both are set in `docker-compose.yml`'s `web` service — `NEXT_PUBLIC_API_URL=http://localhost:3001` and `INTERNAL_API_URL=http://api:3001`. Without `INTERNAL_API_URL`, Server Components try to reach the api at `localhost` from inside the web container, which doesn't work.

**Docker image for the api is unexpectedly large.**
Prisma 7 has a [known dependency-graph regression](https://github.com/prisma/prisma/discussions/28787) that bloats the production image by ~50MB. The Dockerfile already strips `@prisma/dev`, `@prisma/studio-core`, and similar dev-only packages post-install. If the issue is fixed upstream in a future Prisma release, you can remove the cleanup step in `apps/api/Dockerfile`.

## License

MIT

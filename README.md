# Next.js + NestJS Monorepo Template

A production-ready monorepo template with **Next.js 16**, **NestJS 11**, **Turborepo**, and **pnpm workspaces**. Includes a working end-to-end example with shared TypeScript types between frontend and backend.

## What's inside

```
.
├── apps/
│   ├── web/              # Next.js 16 (App Router, Turbopack)
│   └── api/              # NestJS 11
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── turbo.json            # Turborepo task pipeline
└── pnpm-workspace.yaml   # pnpm workspace config
```

### Tech stack

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router and Turbopack
- **[NestJS 11](https://nestjs.com/)** — Progressive Node.js framework for the API
- **[Turborepo 2.9](https://turborepo.dev/)** — Build system with intelligent caching
- **[pnpm](https://pnpm.io/) workspaces** — Fast, disk-efficient package manager
- **TypeScript 5.9** — Shared across all packages

## Prerequisites

- **Node.js 20 LTS** or newer (an `.nvmrc` file is included — run `nvm use`)
- **pnpm 9** or newer (`npm install -g pnpm`)

## Quick start

```bash
# Install dependencies
pnpm install

# Start both apps in development mode
pnpm dev
```

This launches:

- Next.js on [http://localhost:3000](http://localhost:3000)
- NestJS on [http://localhost:3001](http://localhost:3001)

Open [http://localhost:3000](http://localhost:3000). You'll see the web app fetch a health check from the API, demonstrating the shared types in action.

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

Run a script in a specific package only:

```bash
pnpm --filter web dev
pnpm --filter api test
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
- **API (NestJS)** — Build with `pnpm turbo run build --filter=api`, then run `node apps/api/dist/main.js`. Containerize with Docker, or deploy to Railway, Render, Fly.io, etc.

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

### Run only what changed since main

```bash
pnpm turbo run build --filter=...[origin/main]
```

This is the killer feature for CI — only rebuilds packages affected by your changes.

## License

MIT

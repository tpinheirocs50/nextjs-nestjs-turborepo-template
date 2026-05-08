# syntax=docker/dockerfile:1.7

# ---- Base ----
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache libc6-compat

# ---- Builder ----
FROM base AS builder
WORKDIR /workspace

# Copy workspace manifests for layer caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/api-client/package.json ./packages/api-client/

# Install all dependencies (no scripts to avoid postinstall hooks from other apps)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter web... --ignore-scripts

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared-types ./packages/shared-types
COPY packages/api-client ./packages/api-client

# Build with the api URL set via build arg (browser-visible vars must exist at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Server-side secret used by the proxy. Must match the api's BETTER_AUTH_SECRET at runtime.
# Provided as build arg so the prerender step (which runs the server env schema) can validate it.
# At runtime, this is overridden by the BETTER_AUTH_SECRET env var passed via docker-compose.
ARG BETTER_AUTH_SECRET=development-secret-at-least-32-characters-long
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /workspace/apps/web
RUN pnpm build

# ---- Runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy the standalone output (self-contained server)
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone bundle places server.js at apps/web/server.js (monorepo layout)
CMD ["node", "apps/web/server.js"]
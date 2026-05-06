# syntax=docker/dockerfile:1.7

# ---- Base ----
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache libc6-compat openssl

# ---- Builder ----
FROM base AS builder
WORKDIR /workspace

# Copy workspace manifests first (for better layer caching)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all dependencies for building
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter api... --ignore-scripts

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared-types ./packages/shared-types

# Generate Prisma client and build the api
WORKDIR /workspace/apps/api
RUN DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder \
    pnpm exec prisma generate
RUN pnpm build

# ---- Production deps stage (only prod deps, no dev tools) ----
FROM base AS prod-deps
WORKDIR /workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter api... --prod --ignore-scripts

# Workaround for Prisma 7 bloat: @prisma/dev and @prisma/studio-core are
# pulled in transitively but not used at runtime. ~50MB savings.
# See https://github.com/prisma/prisma/discussions/28787
RUN rm -rf node_modules/.pnpm/@prisma+dev* \
    node_modules/.pnpm/@prisma+studio-core* \
    node_modules/.pnpm/@prisma+streams-local* \
    node_modules/.pnpm/@prisma+query-plan-executor*

# ---- Runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user before copying files
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# Copy production node_modules from prod-deps stage (chown during copy)
COPY --from=prod-deps --chown=nestjs:nodejs /workspace/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /workspace/apps/api/node_modules ./apps/api/node_modules

# Copy package manifests
COPY --from=builder --chown=nestjs:nodejs /workspace/package.json ./
COPY --from=builder --chown=nestjs:nodejs /workspace/pnpm-workspace.yaml ./
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/package.json ./apps/api/
COPY --from=builder --chown=nestjs:nodejs /workspace/packages/shared-types/package.json ./packages/shared-types/

# Copy build artifacts only (no source files, no tests, no configs)
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/src/prisma/generated ./apps/api/src/prisma/generated
COPY --from=builder --chown=nestjs:nodejs /workspace/packages/shared-types/src ./packages/shared-types/src

USER nestjs
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
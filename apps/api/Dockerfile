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

# ---- Deploy (self-contained prod node_modules) ----
# pnpm deploy produces a flat, self-contained directory with only the
# packages api actually uses at runtime — no shared pnpm store, no
# bleed-over from web's deps (Next.js, sharp, react-dom, etc.).
# Requires inject-workspace-packages=true in .npmrc.
FROM builder AS deploy
WORKDIR /workspace
RUN pnpm --filter api --prod --ignore-scripts deploy /out/api

# ---- Runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user before copying files
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# Copy the self-contained app from the deploy stage
COPY --from=deploy --chown=nestjs:nodejs /out/api ./

# Copy build artifacts (dist + Prisma migrations + generated client)
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/src/prisma/generated ./src/prisma/generated

USER nestjs
EXPOSE 3001
CMD ["node", "dist/src/main.js"]

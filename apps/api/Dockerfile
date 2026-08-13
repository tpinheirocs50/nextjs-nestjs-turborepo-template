# syntax=docker/dockerfile:1.7
# ---- Base ----
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache libc6-compat openssl ca-certificates
# Amazon's RDS CA chain isn't in Node's bundled trust store, so pg's
# certificate verification fails with "self-signed certificate in
# certificate chain". NODE_EXTRA_CA_CERTS appends rather than replaces,
# so Resend/OAuth TLS keeps working.
RUN wget -qO /usr/local/share/ca-certificates/rds-global-bundle.crt \
    https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/rds-global-bundle.crt

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

# ---- Migrate ----
FROM base AS migrate
WORKDIR /workspace

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter api... --ignore-scripts

COPY apps/api ./apps/api
COPY packages/shared-types ./packages/shared-types

WORKDIR /workspace/apps/api

# Migrations hold DATABASE_URL and the full source tree; no reason to run them
# as root when the runtime image doesn't.
RUN addgroup -S nodejs && adduser -S migrator -G nodejs \
    && chown -R migrator:nodejs /workspace
USER migrator

ENTRYPOINT ["pnpm", "exec", "prisma", "migrate", "deploy"]

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

# wget is a BusyBox applet in node:24-alpine — no curl, and nothing extra to
# install. Gives Compose a real readiness signal instead of "container exists".
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
    CMD wget -qO- "http://127.0.0.1:${PORT:-3001}/health" || exit 1

CMD ["node", "dist/src/main.js"]

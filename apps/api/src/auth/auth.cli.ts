/**
 * CLI-only Better Auth config.
 *
 * This file exists ONLY for the Better Auth CLI to introspect the configuration
 * and generate the Prisma schema additions. It is NOT used at runtime.
 *
 * At runtime, `auth.config.ts` exports `createAuth(prisma)` — a factory that
 * receives the DI-managed PrismaService from NestJS so we get a single shared
 * connection pool.
 *
 * If you change feature flags (e.g. enable a plugin) in `auth.config.ts`,
 * mirror the change here so the schema stays in sync.
 */
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true, autoSignIn: true },
});

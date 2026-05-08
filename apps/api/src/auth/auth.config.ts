import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { PrismaClient } from '../prisma/generated/client';
import type { EmailService } from '../email/email.service';
import { env } from '../env';

export function createAuth(prisma: PrismaClient, email: EmailService) {
  const socialProviders: Parameters<typeof betterAuth>[0]['socialProviders'] =
    {};

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: env.RESEND_API_KEY !== undefined,
    },
    emailVerification: {
      sendOnSignUp: env.RESEND_API_KEY !== undefined,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        // Better Auth's auto-generated URL has callbackURL=/ (resolved against
        // the api). Rewrite it to point at the web origin so the post-verify
        // redirect lands on the dashboard.
        const verifyUrl = new URL(url);
        verifyUrl.searchParams.set(
          'callbackURL',
          `${env.CORS_ORIGIN}/dashboard`,
        );

        await email.send({
          to: user.email,
          subject: 'Verify your email',
          html: `
      <p>Hi ${user.name ?? ''},</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verifyUrl.toString()}">Verify email</a></p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
          text: `Hi ${user.name ?? ''},\n\nVerify your email: ${verifyUrl.toString()}\n\nIf you didn't create an account, ignore this email.`,
        });
      },
    },
    socialProviders,
    trustedOrigins: [env.CORS_ORIGIN],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
        strategy: 'jwe', // fully encrypted; not readable by clients
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

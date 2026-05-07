"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export const dynamic = "force-dynamic";

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Monorepo Template</h1>
      <p>Next.js 16 + NestJS 11 + Turborepo + Prisma + Pino + Better Auth</p>

      {isPending ? (
        <p>Loading…</p>
      ) : session ? (
        <p>
          Signed in as <strong>{session.user.email}</strong>.{" "}
          <Link href="/dashboard">Go to dashboard</Link>
        </p>
      ) : (
        <p>
          <Link href="/sign-in">Sign in</Link> or{" "}
          <Link href="/sign-up">Sign up</Link>
        </p>
      )}
    </main>
  );
}

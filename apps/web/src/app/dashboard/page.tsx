"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { Me } from "@repo/shared-types";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [meError, setMeError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    api.me.get({ credentials: "include" })
      .then((data: Me) => setMe(data))
      .catch((err: unknown) =>
        setMeError(err instanceof Error ? err.message : "Failed to fetch /me"),
      );
  }, [session]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (sessionPending) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <p>Loading…</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>Not signed in</h1>
        <p>
          Please <a href="/sign-in">sign in</a> to view this page.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Dashboard</h1>
      <p>
        Signed in as <strong>{session.user.email}</strong>
      </p>

      <h2 style={{ marginTop: "2rem" }}>Authenticated API call</h2>
      <p style={{ color: "#666" }}>
        This data came from <code>GET /me</code>, a protected NestJS endpoint
        that uses the <code>@Session()</code> decorator from{" "}
        <code>@thallesp/nestjs-better-auth</code>.
      </p>

      {meError && (
        <p style={{ color: "crimson" }}>Error fetching /me: {meError}</p>
      )}

      {me && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
          }}
        >
          {JSON.stringify(me, null, 2)}
        </pre>
      )}

      <button
        type="button"
        onClick={handleSignOut}
        style={{
          padding: "0.75rem",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        Sign out
      </button>
    </main>
  );
}

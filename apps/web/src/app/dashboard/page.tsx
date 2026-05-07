"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (isPending) {
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

      <pre
        style={{
          background: "#f4f4f4",
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        {JSON.stringify(session, null, 2)}
      </pre>

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

import { env } from "@/env";
import type { HealthCheck } from "@repo/shared-types";

async function getHealth(): Promise<HealthCheck | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/health`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Monorepo Template</h1>
      <p>Next.js 16 + NestJS 11 + Turborepo</p>
      <h2>API Health Check</h2>
      {health ? (
        <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        <p style={{ color: "crimson" }}>
          API is not reachable. Make sure it&apos;s running on port 3001.
        </p>
      )}
    </main>
  );
}

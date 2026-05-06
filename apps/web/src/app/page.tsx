import type { HealthCheck } from "@repo/shared-types";
import { ApiError, type User } from "@repo/api-client";
import { api } from "@/lib/api";

export const dynamic = 'force-dynamic';

async function getHealth(): Promise<HealthCheck | null> {
  try {
    return await api.health.get();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API error: ${error.status} ${error.message}`);
    } else {
      console.error('Network error:', error);
    }
    return null;
  }
}

async function getUsers(): Promise<User[]> {
  try {
    return await api.users.list();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API error: ${error.status} ${error.message}`);
    } else {
      console.error('Network error:', error);
    }
    return [];
  }
}

export default async function Home() {
  const [health, users] = await Promise.all([getHealth(), getUsers()]);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Monorepo Template</h1>
      <p>Next.js 16 + NestJS 11 + Turborepo + Prisma + Pino</p>

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

      <h2>Users from Database</h2>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name ?? "(no name)"} — {user.email}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "gray" }}>No users found.</p>
      )}
    </main>
  );
}
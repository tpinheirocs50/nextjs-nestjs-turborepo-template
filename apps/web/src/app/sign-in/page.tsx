"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn.email({
      email,
      password,
    });

    setIsPending(false);

    if (error) {
      setError(error.message ?? "Sign-in failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 400 }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          style={{ padding: "0.75rem", cursor: "pointer" }}
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: "1rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
      </p>
    </main>
  );
}

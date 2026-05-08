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

  async function handleGoogleSignIn() {
    setError(null);
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });

    if (error) {
      setError(error.message ?? "Google sign-in failed");
    }
  }

  async function handleGitHubSignIn() {
    setError(null);
    const { error } = await signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}/dashboard`,
    });

    if (error) {
      setError(error.message ?? "GitHub sign-in failed");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 400 }}>
      <h1>Sign in</h1>
      <form
        onSubmit={handleSubmit}
        method="post"
        style={{ display: "grid", gap: "1rem" }}
      >
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

      <div
        style={{
          textAlign: "center",
          color: "#666",
          margin: "1.5rem 0 1rem",
        }}
      >
        — or —
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={{
            padding: "0.75rem",
            cursor: "pointer",
            width: "100%",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={handleGitHubSignIn}
          style={{
            padding: "0.75rem",
            cursor: "pointer",
            width: "100%",
            background: "#24292f",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Sign in with GitHub
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: "1rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
      </p>
    </main>
  );
}

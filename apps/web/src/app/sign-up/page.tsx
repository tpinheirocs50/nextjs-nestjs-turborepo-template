"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signIn, signUp } from "@/lib/auth-client";

export default function SignUpPage() {
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
    const name = formData.get("name") as string;

    const { error } = await signUp.email({
      email,
      password,
      name,
    });

    setIsPending(false);

    if (error) {
      setError(error.message ?? "Sign-up failed");
      return;
    }

    router.push("/dashboard");
  }

  async function handleGoogleSignUp() {
    setError(null);
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });

    if (error) {
      setError(error.message ?? "Google sign-up failed");
    }
  }

  async function handleGitHubSignUp() {
    setError(null);
    const { error } = await signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}/dashboard`,
    });

    if (error) {
      setError(error.message ?? "GitHub sign-up failed");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 400 }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label>
          Name
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </label>
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
            minLength={8}
            autoComplete="new-password"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          style={{ padding: "0.75rem", cursor: "pointer" }}
        >
          {isPending ? "Signing up…" : "Sign up"}
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
          onClick={handleGoogleSignUp}
          style={{
            padding: "0.75rem",
            cursor: "pointer",
            width: "100%",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Sign up with Google
        </button>

        <button
          type="button"
          onClick={handleGitHubSignUp}
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
          Sign up with GitHub
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: "1rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </main>
  );
}

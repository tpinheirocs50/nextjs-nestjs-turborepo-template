"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signUp } from "@/lib/auth-client";

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

      {error && <p style={{ color: "crimson", marginTop: "1rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { login, storeAuth } from "@/lib/auth-api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const auth = await login({ email, password });
      storeAuth(auth);
      router.push("/dashboard/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" href="/">
        <div className="logo-mark">BA</div>
        <span>Brain Assistant 23</span>
      </Link>

      <form className="auth-panel" onSubmit={handleSubmit}>
        <div className="auth-panel-head">
          <span className="eyebrow">Admin login</span>
          <h1>Welcome back</h1>
          <p>Sign in to continue configuring your Brain Assistant workspace.</p>
        </div>

        {error ? <div className="form-alert error">{error}</div> : null}

        <Field label="Email">
          <input
            className="form-control"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>

        <Field label="Password">
          <input
            className="form-control"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>

        <button className="btn btn-primary w-full justify-center" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-switch">
          New workspace? <Link href="/onboarding">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

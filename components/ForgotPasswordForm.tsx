"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { forgotPassword } from "@/lib/auth-api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword({ email });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Logo />
      </header>

      <form className="auth-panel" onSubmit={handleSubmit}>
        <div className="auth-panel-head">
          <span className="eyebrow">Password help</span>
          <h1>Reset password</h1>
          <p>Enter your account email and we will send a reset link.</p>
        </div>

        {message ? <div className="form-alert success">{message}</div> : null}
        {error ? <div className="form-alert error">{error}</div> : null}

        <label className="field">
          <span>Email</span>
          <input
            className="form-control"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <button className="btn btn-primary w-full justify-center" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>

        <p className="auth-switch">
          Remembered it? <Link href="/login">Back to login</Link>
        </p>
      </form>
    </main>
  );
}

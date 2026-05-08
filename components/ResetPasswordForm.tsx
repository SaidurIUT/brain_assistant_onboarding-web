"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { PasswordField, passwordMeetsRequirements } from "@/components/PasswordField";
import { clearStoredAuth, resetPassword } from "@/lib/auth-api";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = searchParams.get("token");
    if (!token) {
      setError("Reset token is missing.");
      return;
    }
    if (!passwordMeetsRequirements(password)) {
      setError("Password must be at least 8 characters and include lowercase, uppercase, number, and symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await resetPassword({
        token,
        new_password: password,
        confirm_password: confirmPassword
      });
      clearStoredAuth();
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
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
          <span className="eyebrow">Password reset</span>
          <h1>Choose a new password</h1>
          <p>Use a strong password before returning to your workspace.</p>
        </div>

        {message ? <div className="form-alert success">{message}</div> : null}
        {error ? <div className="form-alert error">{error}</div> : null}

        {!message ? (
          <>
            <PasswordField
              label="New password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={setPassword}
              showRequirements
              required
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
            />
            <button className="btn btn-primary w-full justify-center" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </>
        ) : (
          <Link className="btn btn-primary w-full justify-center" href="/login">Back to login</Link>
        )}
      </form>
    </main>
  );
}

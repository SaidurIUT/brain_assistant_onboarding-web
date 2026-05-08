"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { PasswordField } from "@/components/PasswordField";
import { acceptInvitation, storeAuth } from "@/lib/auth-api";

export function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = searchParams.get("token");
    if (!token) {
      setError("Invitation token is missing.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const auth = await acceptInvitation({
        token,
        first_name: firstName,
        last_name: lastName,
        password,
        confirm_password: confirmPassword
      });
      storeAuth(auth);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept the invitation.");
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
          <span className="eyebrow">Workspace invitation</span>
          <h1>Join workspace</h1>
          <p>Set your password to activate access to this organization.</p>
        </div>

        {success ? <div className="form-alert success">Invitation accepted. Your dashboard is ready.</div> : null}
        {error ? <div className="form-alert error">{error}</div> : null}

        {!success ? (
          <>
            <div className="field-row">
              <Field label="First name"><input className="form-control" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></Field>
              <Field label="Last name"><input className="form-control" value={lastName} onChange={(event) => setLastName(event.target.value)} /></Field>
            </div>
            <PasswordField label="Password" minLength={8} value={password} onChange={setPassword} showRequirements required />
            <PasswordField label="Confirm password" minLength={8} value={confirmPassword} onChange={setConfirmPassword} required />
            <button className="btn btn-primary w-full justify-center" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Accepting..." : "Accept invitation"}
            </button>
          </>
        ) : (
          <Link className="btn btn-primary w-full justify-center" href="/dashboard/overview">Open dashboard</Link>
        )}
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

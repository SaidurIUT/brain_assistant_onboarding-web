"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthNav } from "@/components/AuthNav";
import { Logo } from "@/components/Logo";
import { completeKeycloakLogin } from "@/lib/auth-api";

export function KeycloakCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const keycloakError = searchParams.get("error_description") ?? searchParams.get("error");

    if (keycloakError) {
      setError(keycloakError);
      return;
    }
    if (!code) {
      setError("Keycloak did not return an authorization code.");
      return;
    }

    completeKeycloakLogin(code, state)
      .then(({ nextPath }) => router.replace(nextPath))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not complete Keycloak sign-in.");
      });
  }, [router, searchParams]);

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Logo />
        <AuthNav variant="onboarding" />
      </header>

      <section className="auth-panel">
        <div className="auth-panel-head">
          <span className="eyebrow">Keycloak</span>
          <h1>{error ? "Sign-in failed" : "Finishing sign-in"}</h1>
          <p>{error ? "The identity provider could not complete the request." : "Connecting your identity to Brain Assistant."}</p>
        </div>
        {error ? <div className="form-alert error">{error}</div> : null}
        {error ? <Link className="btn btn-primary w-full justify-center" href="/login">Back to login</Link> : null}
      </section>
    </main>
  );
}

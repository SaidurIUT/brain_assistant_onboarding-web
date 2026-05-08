"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { storeAuth, verifyEmail } from "@/lib/auth-api";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    verifyEmail(token)
      .then((auth) => {
        storeAuth(auth);
        setStatus("success");
        setMessage("Email verified. You can continue to your dashboard.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Could not verify this email.");
      });
  }, [searchParams]);

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Logo />
      </header>
      <section className="auth-panel">
        <div className="auth-panel-head">
          <span className="eyebrow">Email verification</span>
          <h1>{status === "success" ? "Verified" : "Check complete"}</h1>
          <p>{message}</p>
        </div>
        {status === "success" ? (
          <Link className="btn btn-primary w-full justify-center" href="/dashboard/overview">Open dashboard</Link>
        ) : null}
        {status === "error" ? (
          <Link className="btn btn-secondary w-full justify-center" href="/login">Back to login</Link>
        ) : null}
      </section>
    </main>
  );
}

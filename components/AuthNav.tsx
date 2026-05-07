"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredUser, logout, type AuthUser } from "@/lib/auth-api";

type AuthNavProps = {
  variant?: "landing" | "dashboard" | "onboarding";
};

export function AuthNav({ variant = "landing" }: AuthNavProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    window.location.href = "/";
  }

  if (!mounted) {
    return (
      <div className={`auth-actions ${variant}`}>
        <Link className="btn btn-ghost" href="/login">Log in</Link>
        {variant !== "onboarding" && <Link className="btn btn-primary" href="/onboarding">Sign up</Link>}
      </div>
    );
  }

  if (user) {
    return (
      <div className={`auth-actions ${variant}`}>
        <Link className="btn btn-secondary" href="/dashboard/overview">Dashboard</Link>
        <button className="btn btn-dark" type="button" onClick={handleLogout}>Log out</button>
      </div>
    );
  }

  return (
    <div className={`auth-actions ${variant}`}>
      <Link className="btn btn-ghost" href="/login">Log in</Link>
      {variant !== "onboarding" && <Link className="btn btn-primary" href="/onboarding">Sign up</Link>}
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailClient } from "@/components/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your Brain Assistant account email."
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailClient />
    </Suspense>
  );
}

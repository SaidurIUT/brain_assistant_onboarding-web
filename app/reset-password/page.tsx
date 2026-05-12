import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new Brain Assistant account password."
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

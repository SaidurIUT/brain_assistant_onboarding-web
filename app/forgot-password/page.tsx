import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a Brain Assistant password reset link."
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

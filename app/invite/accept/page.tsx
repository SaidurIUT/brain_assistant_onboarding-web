import type { Metadata } from "next";
import { Suspense } from "react";
import { AcceptInvitationForm } from "@/components/AcceptInvitationForm";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Accept a Brain Assistant workspace invitation."
};

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitationForm />
    </Suspense>
  );
}

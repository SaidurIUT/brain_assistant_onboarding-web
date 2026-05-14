import type { Metadata } from "next";
import { Suspense } from "react";
import { KeycloakCallbackClient } from "@/components/KeycloakCallbackClient";

export const metadata: Metadata = {
  title: "Keycloak sign-in",
  description: "Complete Keycloak sign-in for Brain Assistant 23."
};

export default function KeycloakCallbackPage() {
  return (
    <Suspense fallback={null}>
      <KeycloakCallbackClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Configure a Brain Assistant workspace with dummy company, knowledge source, API, and Chatwoot data."
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}

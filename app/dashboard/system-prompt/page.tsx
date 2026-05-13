import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("system-prompt");

export default function SystemPromptPage() {
  return <DashboardRoutePage slug="system-prompt" />;
}

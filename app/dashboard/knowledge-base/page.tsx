import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("knowledge-base");

export default function KnowledgeBasePage() {
  return <DashboardRoutePage slug="knowledge-base" />;
}

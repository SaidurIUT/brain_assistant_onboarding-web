import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("insights");

export default function InsightsPage() {
  return <DashboardRoutePage slug="insights" />;
}

import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("overview");

export default function OverviewPage() {
  return <DashboardRoutePage slug="overview" />;
}

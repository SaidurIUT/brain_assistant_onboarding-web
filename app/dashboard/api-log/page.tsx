import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("api-log");

export default function ApiLogPage() {
  return <DashboardRoutePage slug="api-log" />;
}

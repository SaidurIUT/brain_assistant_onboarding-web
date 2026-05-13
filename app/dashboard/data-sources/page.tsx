import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("data-sources");

export default function DataSourcesPage() {
  return <DashboardRoutePage slug="data-sources" />;
}

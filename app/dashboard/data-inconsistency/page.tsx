import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("data-inconsistency");

export default function DataInconsistencyPage() {
  return <DashboardRoutePage slug="data-inconsistency" />;
}

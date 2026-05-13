import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("api-configurator");

export default function ApiConfiguratorPage() {
  return <DashboardRoutePage slug="api-configurator" />;
}

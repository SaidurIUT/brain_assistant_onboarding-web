import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("profiles");

export default function ProfilesPage() {
  return <DashboardRoutePage slug="profiles" />;
}

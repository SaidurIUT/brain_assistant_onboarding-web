import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("settings");

export default function SettingsPage() {
  return <DashboardRoutePage slug="settings" />;
}

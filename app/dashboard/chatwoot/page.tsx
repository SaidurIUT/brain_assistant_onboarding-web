import { DashboardRoutePage, dashboardMetadata } from "../DashboardRoutePage";

export const metadata = dashboardMetadata("chatwoot");

export default function ChatwootPage() {
  return <DashboardRoutePage slug="chatwoot" />;
}

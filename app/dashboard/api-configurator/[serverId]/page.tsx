import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

type ApiServerPageProps = {
  params: Promise<{ serverId: string }>;
};

export const metadata: Metadata = {
  title: "API Server Configuration",
  description: "Configure a backend server API for Brain Assistant 23."
};

export default async function ApiServerPage({ params }: ApiServerPageProps) {
  const { serverId } = await params;

  return (
    <main className="dashboard-page" aria-label="API server configuration">
      <Dashboard slug="api-configurator" apiServerId={serverId} />
    </main>
  );
}

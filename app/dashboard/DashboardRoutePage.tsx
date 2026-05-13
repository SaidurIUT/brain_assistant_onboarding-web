import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";
import { dashboardTitles, type DashboardSlug } from "@/lib/dashboard-data";

export function dashboardMetadata(slug: DashboardSlug): Metadata {
  return {
    title: dashboardTitles[slug],
    description: `Dummy ${dashboardTitles[slug]} dashboard screen for Brain Assistant 23.`
  };
}

export function DashboardRoutePage({ slug }: { slug: DashboardSlug }) {
  return (
    <main className="dashboard-page" aria-label={`${dashboardTitles[slug]} dashboard demo`}>
      <Dashboard slug={slug} />
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { dashboardSlugs, dashboardTitles, type DashboardSlug } from "@/lib/dashboard-data";

type DashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return dashboardSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isDashboardSlug(slug)) return {};
  return {
    title: dashboardTitles[slug],
    description: `Dummy ${dashboardTitles[slug]} dashboard screen for Brain Assistant 23.`
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;
  if (!isDashboardSlug(slug)) notFound();

  return (
    <main className="dashboard-page" aria-label={`${dashboardTitles[slug]} dashboard demo`}>
      <Dashboard slug={slug} />
    </main>
  );
}

function isDashboardSlug(slug: string): slug is DashboardSlug {
  return dashboardSlugs.includes(slug as DashboardSlug);
}

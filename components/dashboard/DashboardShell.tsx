"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { navGroups } from "@/components/dashboard/constants";
import { ApiConfigurator } from "@/components/dashboard/pages/ApiConfigurator";
import { KnowledgeBase } from "@/components/dashboard/pages/KnowledgeBase";
import { Overview } from "@/components/dashboard/pages/Overview";
import { Settings } from "@/components/dashboard/pages/Settings";
import {
  ApiLog,
  Chatwoot,
  DataInconsistency,
  DataSources,
  Insights,
  Profiles,
  SystemPrompt
} from "@/components/dashboard/pages/StaticPages";
import { initials } from "@/components/dashboard/utils";
import type { WorkspaceSettings } from "@/lib/auth-api";
import {
  clearStoredAuth,
  getWorkspaceSettings,
  isKeycloakAuthEnabled,
  logout,
  startKeycloakLogout
} from "@/lib/auth-api";
import {
  dashboardTitles,
  type DashboardSlug
} from "@/lib/dashboard-data";

type DashboardProps = {
  slug: DashboardSlug;
  apiServerId?: string;
};

export function Dashboard({ slug, apiServerId }: DashboardProps) {
  const title = dashboardTitles[slug];
  const router = useRouter();
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const selectedCompanyId = window.localStorage.getItem("brain_assistant_company_id") ?? undefined;
    const nextPath = apiServerId ? `/dashboard/${slug}/${apiServerId}` : `/dashboard/${slug}`;
    getWorkspaceSettings(selectedCompanyId)
      .then((data) => {
        setSettings(data);
        window.localStorage.setItem("brain_assistant_company_id", data.company.id);
      })
      .catch(() => {
        clearStoredAuth();
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      })
      .finally(() => setIsLoading(false));
  }, [apiServerId, router, slug]);

  async function switchWorkspace(companyId: string) {
    setIsLoading(true);
    try {
      const data = await getWorkspaceSettings(companyId);
      setSettings(data);
      window.localStorage.setItem("brain_assistant_company_id", data.company.id);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    if (isKeycloakAuthEnabled()) {
      await startKeycloakLogout();
      return;
    }
    await logout();
    window.location.href = "/";
  }

  if (isLoading && !settings) {
    return <div className="dashboard-loading">Loading your workspace...</div>;
  }

  if (!settings) return null;

  const userInitials = initials(settings.user.first_name, settings.user.last_name, settings.user.email);
  const userName = `${settings.user.first_name} ${settings.user.last_name}`.trim() || settings.user.email;

  return (
    <div className="db-layout">
      <div className="db-shell">
        <aside className="db-sidebar">
          <Link className="db-brand" href="/dashboard/overview" aria-label="Brain Assistant dashboard">
            <span className="logo-mark">BA</span>
            <span className="db-brand-text"><strong>{settings.company.name}</strong><span>Brain Assistant</span></span>
          </Link>
          <nav className="db-nav" aria-label="Dashboard navigation">
            {navGroups.map((group) => (
              <div className="db-nav-group" key={group.label}>
                <div className="db-nav-label">{group.label}</div>
                {group.items.map(([hrefSlug, icon, label]) => (
                  <Link className={`db-nav-item ${slug === hrefSlug ? "active" : ""}`} href={`/dashboard/${hrefSlug}`} key={hrefSlug}>
                    <span className="ni-icon">{icon}</span>{label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="db-sidebar-footer">
            <button className="db-user" type="button" onClick={handleLogout} aria-label={`Log out ${userName}`} title="Log out">
              <span className="db-avatar">{userInitials}</span>
              <span className="db-user-info"><strong>{userName}</strong><span>{settings.current_role}: {settings.company.name}</span></span>
            </button>
          </div>
        </aside>

        <div className="db-main-panel">
          <header className="db-topbar">
            <div className="db-controls">
              <div className="search-box">Search {title.toLowerCase()}...</div>
              <select
                className="workspace-switcher"
                value={settings.company.id}
                onChange={(event) => switchWorkspace(event.target.value)}
                aria-label="Switch workspace"
              >
                {settings.workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                ))}
              </select>
              <Link className="btn btn-secondary btn-sm" href="/onboarding">New workspace</Link>
            </div>
            <div className="db-topbar-right">
              <button className="db-icon-btn search-icon" type="button" aria-label={`Search ${title}`} />
              <button className="db-icon-btn bell-icon notification-dot" type="button" aria-label="Alerts" />
              <button className="db-avatar-btn" type="button" onClick={handleLogout} aria-label={`Log out ${userName}`} title="Log out">
                <span className="db-avatar">{userInitials}</span>
              </button>
            </div>
          </header>
          <div className="db-control-strip">
            <div className="db-title-block">
              <h1>{title}</h1>
              <span className="db-link-dot" aria-hidden="true" />
            </div>
          </div>
          {!settings.user.email_verified ? (
            <div className="verify-banner">
              <div>
                <strong>Verify your email</strong>
                <span>Check your inbox to finish verification. Team invitations stay locked until this is done.</span>
              </div>
              <a className="btn btn-secondary btn-sm" href="http://localhost:8125" target="_blank" rel="noreferrer">Open dev inbox</a>
            </div>
          ) : null}
          <div className="db-content">
            {isLoading ? <div className="form-alert success mb-4">Switching workspace...</div> : null}
            <DashboardContent slug={slug} apiServerId={apiServerId} settings={settings} onSettingsChange={setSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({
  slug,
  apiServerId,
  settings,
  onSettingsChange
}: DashboardProps & {
  settings: WorkspaceSettings;
  onSettingsChange: (settings: WorkspaceSettings) => void;
}) {
  if (slug === "overview") return <Overview settings={settings} />;
  if (slug === "api-configurator") return <ApiConfigurator companyId={settings.company.id} serverId={apiServerId} />;
  if (slug === "api-log") return <ApiLog />;
  if (slug === "knowledge-base") return <KnowledgeBase settings={settings} />;
  if (slug === "data-sources") return <DataSources />;
  if (slug === "data-inconsistency") return <DataInconsistency />;
  if (slug === "insights") return <Insights />;
  if (slug === "system-prompt") return <SystemPrompt />;
  if (slug === "chatwoot") return <Chatwoot />;
  if (slug === "settings") return <Settings initialSettings={settings} onSettingsChange={onSettingsChange} />;
  return <Profiles />;
}

"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { AuthNav } from "@/components/AuthNav";
import type {
  BrandSettings,
  CompanyMember,
  CompanySettings,
  MemberRole,
  WorkspaceSettings
} from "@/lib/auth-api";
import {
  addMember,
  changePassword,
  clearStoredAuth,
  getWorkspaceSettings,
  updateBrandSettings,
  updateCompanySettings,
  updateMemberRole,
  updateUserName
} from "@/lib/auth-api";
import {
  apiEndpoints,
  apiLogs,
  dashboardTitles,
  profiles,
  sourceRows,
  stats,
  topics,
  type DashboardSlug
} from "@/lib/dashboard-data";

type DashboardProps = {
  slug: DashboardSlug;
};

const navGroups = [
  { label: "Overview", items: [["overview", "OV", "Overview"]] },
  {
    label: "Knowledge",
    items: [
      ["knowledge-base", "KB", "Knowledge Base"],
      ["data-sources", "DS", "Data Sources"],
      ["data-inconsistency", "DI", "Data Inconsistency"],
      ["insights", "IN", "Conversation Insights"]
    ]
  },
  {
    label: "Automation",
    items: [
      ["api-configurator", "API", "API Configurator"],
      ["api-log", "LOG", "API Call Log"],
      ["system-prompt", "SP", "System Prompt Configuration"],
      ["profiles", "CP", "Customer Profiles"]
    ]
  },
  {
    label: "Integration",
    items: [
      ["chatwoot", "CW", "Chatwoot"],
      ["settings", "ST", "Settings & Brand"]
    ]
  }
] as const;

export function Dashboard({ slug }: DashboardProps) {
  const title = dashboardTitles[slug];

  return (
    <div className="db-layout">
      <aside className="db-sidebar">
        <Link className="db-brand" href="/">
          <div className="logo-mark">BA</div>
          <div className="db-brand-text"><strong>Acme Support</strong><span>Brain Assistant 23</span></div>
        </Link>
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
        <div className="db-sidebar-footer">
          <div className="db-user">
            <div className="db-avatar">JD</div>
            <div className="db-user-info"><strong>Jane Doe</strong><span>Admin: Acme Corp</span></div>
          </div>
        </div>
      </aside>

      <div className="db-main">
        <header className="db-topbar">
          <span className="page-title">{title}</span>
          <div className="db-topbar-right">
            <div className="search-box">Search knowledge base...</div>
            <button className="btn btn-secondary btn-sm notification-dot">Alerts</button>
            <Link className="btn btn-primary btn-sm" href="/onboarding">New workspace</Link>
            <AuthNav variant="dashboard" />
          </div>
        </header>
        <div className="db-content">
          <DashboardContent slug={slug} />
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ slug }: DashboardProps) {
  if (slug === "overview") return <Overview />;
  if (slug === "api-configurator") return <ApiConfigurator />;
  if (slug === "api-log") return <ApiLog />;
  if (slug === "knowledge-base") return <KnowledgeBase />;
  if (slug === "data-sources") return <DataSources />;
  if (slug === "data-inconsistency") return <DataInconsistency />;
  if (slug === "insights") return <Insights />;
  if (slug === "system-prompt") return <SystemPrompt />;
  if (slug === "chatwoot") return <Chatwoot />;
  if (slug === "settings") return <Settings />;
  return <Profiles />;
}

function Overview() {
  return (
    <>
      <StatRow />
      <div className="grid-2">
        <Card title="Activity">
          <div className="activity-feed">
            {["64 new KB entries generated", "Google Drive sync completed", "Knowledge gap detected", "Swagger spec re-indexed", "Chatwoot whitelabeling applied"].map((item, index) => (
              <div className="act-item" key={item}>
                <div className="act-dot" style={{ background: ["var(--green)", "var(--brand)", "var(--amber)", "var(--accent)", "var(--green)"][index] }} />
                <div className="act-body"><strong>{item}</strong><p>Dummy operational event for onboarding demo data.</p></div>
                <span className="act-time">{index + 2}h ago</span>
              </div>
            ))}
          </div>
        </Card>
        <TopicCard />
      </div>
    </>
  );
}

function KnowledgeBase() {
  return (
    <>
      <PageIntro title="Knowledge Base" body="4,213 entries from connected website, API docs, cloud drives, and uploads." action="Add source" />
      <div className="grid-left-heavy">
        <Card title="Top knowledge topics"><TopicList /></Card>
        <Card title="Source health">
          {sourceRows.map(([name, detail, metric, sync, status]) => (
            <div className="source-row" key={name}>
              <div className="src-row-icon" style={{ background: "var(--brand-50)" }}>{name.slice(0, 2).toUpperCase()}</div>
              <div className="src-row-info"><strong>{name}</strong><span>{detail}</span></div>
              <div className="src-row-meta"><span className="badge badge-green">{status}</span><span className="text-sm text-muted">{metric}</span><span className="text-sm text-muted">{sync}</span></div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function ApiConfigurator() {
  return (
    <>
      <PageIntro title="API Configurator" body="Control which backend actions the assistant can call through the MCP server." action="Import OpenAPI" />
      <div className="api-header">
        <span className="api-base">https://api.acme.com/v1</span>
        <span className="badge badge-green">Bearer auth connected</span>
      </div>
      <div className="api-body">
        {apiEndpoints.map(([method, path, desc, permission, note]) => (
          <div className="api-row" key={`${method}-${path}`}>
            <span className={`method-pill ${methodClass(method)}`}>{method}</span>
            <span className="api-path">{path}</span>
            <span className="api-desc">{desc}</span>
            <div className="api-perms">
              <span className={`perm-chip ${permission === "AI allowed" ? "perm-ai" : permission === "Disabled" || permission === "Human only" ? "perm-off" : "perm-auth"}`}>{permission}</span>
              <span className="perm-chip perm-auth">{note}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid-3 mt-6">
        <MiniPanel title="Permission model" value="Confirm risky actions" />
        <MiniPanel title="Tool timeout" value="8 seconds" />
        <MiniPanel title="Audit logging" value="Enabled" />
      </div>
    </>
  );
}

function ApiLog() {
  return (
    <>
      <PageIntro title="API Call Log" body="Review assistant tool calls before wiring live MCP actions." />
      <Card title="Recent calls">
        <table className="db-table">
          <thead><tr><th>Time</th><th>Method</th><th>Endpoint</th><th>Status</th><th>Customer</th><th>Latency</th></tr></thead>
          <tbody>{apiLogs.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={cell}>{index === 1 ? <span className={`method-pill ${methodClass(cell)}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </>
  );
}

function DataSources() {
  return (
    <>
      <PageIntro title="Data Sources" body="Dummy ingestion sources ready to map to real connectors later." action="Connect source" />
      {sourceRows.map(([name, detail, metric, sync, status]) => (
        <div className="ds-card" key={name}>
          <div className="ds-card-head">
            <div className="ds-icon" style={{ background: "var(--accent-50)" }}>{name.slice(0, 2).toUpperCase()}</div>
            <div className="ds-info"><strong>{name}</strong><span>{detail}</span></div>
            <span className="badge badge-green">{status}</span>
          </div>
          <div className="ds-card-body">
            <div className="ds-stat-row">
              <div className="ds-stat"><strong>{metric.split(" ")[0]}</strong><span>{metric.replace(metric.split(" ")[0], "").trim() || "Items"}</span></div>
              <div className="ds-stat"><strong>847</strong><span>Chunks</span></div>
              <div className="ds-stat"><strong>99%</strong><span>Healthy</span></div>
              <div className="ds-stat"><strong>{sync.split(" ")[1] ?? "5h"}</strong><span>Last sync</span></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function DataInconsistency() {
  return (
    <>
      <PageIntro title="Data Inconsistency" body="Conflicting facts discovered across website, docs, and support transcripts." />
      <div className="conflict-summary">
        {["3 open", "8 resolved", "2 high impact", "14 sources"].map((item) => <MiniPanel title={item.split(" ").slice(1).join(" ")} value={item.split(" ")[0]} key={item} />)}
      </div>
      {["Trial period mismatch", "Refund window conflict", "Enterprise SLA wording"].map((item) => (
        <div className="conflict-card" key={item}>
          <div className="conflict-head"><div className="conflict-title"><strong>{item}</strong><span>Detected in multiple connected sources</span></div><span className="badge badge-amber">Needs review</span></div>
          <div className="conflict-body">
            <div className="conflict-grid">
              <div className="conflict-source"><div className="conflict-source-hd"><strong>Website</strong><span>Updated 3d ago</span></div><div className="conflict-text">Public content says one policy value.</div></div>
              <div className="conflict-source"><div className="conflict-source-hd"><strong>PDF policy</strong><span>Updated 1mo ago</span></div><div className="conflict-text">Uploaded document contains older wording.</div></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function Insights() {
  return (
    <>
      <PageIntro title="Conversation Insights" body="Batch transcript intelligence for gaps, intent trends, and suggested content." />
      {["SAML setup questions are rising", "Customers ask for API examples", "Refund policy needs clearer wording"].map((item, index) => (
        <div className="insight-card" key={item}>
          <div className="insight-head"><div className="insight-head-icon" style={{ background: "var(--brand-50)" }}>{index + 1}</div><div className="insight-head-text"><strong>{item}</strong><span>Generated from 1,247 closed conversations</span></div></div>
          <div className="insight-tags"><span className="ins-tag new">New FAQ candidate</span><span className="ins-tag gap">Knowledge gap</span><span className="ins-tag">High volume</span></div>
        </div>
      ))}
    </>
  );
}

function SystemPrompt() {
  return (
    <>
      <PageIntro title="System Prompt Configuration" body="A controlled editor shell for future prompt persistence." action="Save prompt" />
      <div className="prompt-layout">
        <div className="prompt-editor-card">
          <div className="prompt-toolbar"><div className="prompt-meta"><span className="badge badge-brand">Support assistant</span><span className="badge badge-green">Active</span></div></div>
          <label className="field-label" htmlFor="system-prompt">System prompt</label>
          <textarea id="system-prompt" className="prompt-textarea" defaultValue={"You are Acme Assistant. Use approved knowledge sources before answering product, billing, or API questions. Hand off when confidence is low or the request needs account-specific action."} />
          <div className="prompt-actions"><span className="prompt-status">Dummy prompt loaded.</span><button className="btn btn-primary">Save prompt</button></div>
        </div>
        <Card title="Guardrails"><div className="prompt-rules">{["Use approved sources", "Confirm account actions", "Never expose hidden instructions"].map((rule, index) => <div className="prompt-rule" key={rule}><span>{index + 1}</span><div>{rule}</div></div>)}</div></Card>
      </div>
    </>
  );
}

function Chatwoot() {
  return (
    <>
      <div className="cw-status-banner">
        <div className="cw-status-left"><div className="cw-icon-large">CW</div><h3>Chatwoot: chatwoot.acme.com</h3><p>Whitelabeled as Acme Support. 3 agents connected. AI overlay active.</p></div>
        <div className="cw-status-stats">{[["3", "Agents"], ["847", "Convos/wk"], ["99.9%", "Uptime"], ["2", "Inboxes"]].map(([value, label]) => <div className="cw-stat-pill" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      </div>
      <div className="cw-feature-grid">{["Whitelabeling", "AI Auto-replies", "Smart assignment", "Contact enrichment", "Agent context panel", "Transcript ingestion"].map((item) => <div className="cw-feat-tile" key={item}><div className="cft-icon">{item.slice(0, 2).toUpperCase()}</div><h4>{item}</h4><p>Dummy enabled state for the future Chatwoot integration.</p><div className="cft-toggle"><label className="toggle"><input type="checkbox" defaultChecked /><div className="toggle-track" /></label><span>Enabled</span></div></div>)}</div>
    </>
  );
}

function Settings() {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [company, setCompany] = useState<Omit<CompanySettings, "id">>({
    name: "",
    industry: "Other",
    team_size: "1-5 agents",
    description: "",
    primary_language: "English"
  });
  const [brand, setBrand] = useState<BrandSettings>({
    workspace_name: "Brain Assistant Workspace",
    assistant_name: "Brain Assistant",
    widget_greeting: "Hi! I am Brain Assistant. How can I help?",
    primary_color: "#6366f1",
    accent_color: "#06b6d4",
    widget_background: "#ffffff",
    logo_url: ""
  });
  const [userName, setUserName] = useState({ first_name: "", last_name: "" });
  const [memberForm, setMemberForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "agent" as MemberRole
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getWorkspaceSettings()
      .then((data) => {
        setSettings(data);
        setCompany({
          name: data.company.name,
          industry: data.company.industry,
          team_size: data.company.team_size,
          description: data.company.description,
          primary_language: data.company.primary_language
        });
        setBrand(data.brand);
        setUserName({ first_name: data.user.first_name, last_name: data.user.last_name });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load settings."));
  }, []);

  async function saveAccountSettings() {
    setIsSaving(true);
    setError(null);
    try {
      const user = await updateUserName(userName);
      setSettings((existing) => existing ? { ...existing, user } : existing);
      setNotice("User name updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update user name.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveCompanySettings() {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await updateCompanySettings(company);
      setSettings((existing) => existing ? { ...existing, company: saved } : existing);
      setNotice("Company settings updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update company settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveBrandSettings() {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await updateBrandSettings(brand);
      setSettings((existing) => existing ? { ...existing, brand: saved } : existing);
      setNotice("Brand settings updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update brand settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function inviteMember() {
    setIsSaving(true);
    setError(null);
    try {
      const member = await addMember(memberForm);
      setSettings((existing) => existing ? { ...existing, members: [...existing.members, member] } : existing);
      setMemberForm({ email: "", first_name: "", last_name: "", role: "agent" });
      setNotice("Member added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add member.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changeRole(member: CompanyMember, role: MemberRole) {
    try {
      const updated = await updateMemberRole(member.id, role);
      setSettings((existing) => existing ? {
        ...existing,
        members: existing.members.map((item) => item.id === updated.id ? updated : item)
      } : existing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change role.");
    }
  }

  async function savePassword() {
    setIsSaving(true);
    setError(null);
    try {
      await changePassword(passwordForm);
      clearStoredAuth();
      setNotice("Password changed. Please log in again.");
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageIntro title="Settings & Whitelabeling" body="Manage company details, user profile, password, brand identity, members, and roles." />
      {notice ? <div className="form-alert success mb-4">{notice}</div> : null}
      {error ? <div className="form-alert error mb-4">{error}</div> : null}
      <div className="settings-grid">
        <div className="settings-section">
          <h4>User profile</h4>
          <div className="ob-form-stack">
            <div className="field-row">
              <EditableField label="First name" value={userName.first_name} onChange={(value) => setUserName((form) => ({ ...form, first_name: value }))} />
              <EditableField label="Last name" value={userName.last_name} onChange={(value) => setUserName((form) => ({ ...form, last_name: value }))} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveAccountSettings} disabled={isSaving}>Save user name</button>
          </div>
        </div>

        <div className="settings-section">
          <h4>Change password</h4>
          <div className="ob-form-stack">
            <EditableField label="Current password" type="password" value={passwordForm.current_password} onChange={(value) => setPasswordForm((form) => ({ ...form, current_password: value }))} />
            <EditableField label="New password" type="password" value={passwordForm.new_password} onChange={(value) => setPasswordForm((form) => ({ ...form, new_password: value }))} />
            <EditableField label="Confirm new password" type="password" value={passwordForm.confirm_password} onChange={(value) => setPasswordForm((form) => ({ ...form, confirm_password: value }))} />
            <button className="btn btn-dark btn-sm" onClick={savePassword} disabled={isSaving}>Change password</button>
          </div>
        </div>

        <div className="settings-section">
          <h4>Company details</h4>
          <div className="ob-form-stack">
            <EditableField label="Company name" value={company.name} onChange={(value) => setCompany((form) => ({ ...form, name: value }))} />
            <div className="field-row">
              <EditableSelect label="Industry" value={company.industry} options={["SaaS / Software", "E-commerce", "Fintech", "Healthcare", "Other"]} onChange={(value) => setCompany((form) => ({ ...form, industry: value }))} />
              <EditableSelect label="Team size" value={company.team_size} options={["1-5 agents", "6-20 agents", "21-100 agents", "100+ agents"]} onChange={(value) => setCompany((form) => ({ ...form, team_size: value }))} />
            </div>
            <EditableField label="Primary support language" value={company.primary_language} onChange={(value) => setCompany((form) => ({ ...form, primary_language: value }))} />
            <label className="field"><span>Description</span><textarea className="form-control" value={company.description} onChange={(event) => setCompany((form) => ({ ...form, description: event.target.value }))} /></label>
            <button className="btn btn-primary btn-sm" onClick={saveCompanySettings} disabled={isSaving}>Save company</button>
          </div>
        </div>

        <div className="settings-section">
          <h4>Brand identity</h4>
          <div className="ob-form-stack">
            <EditableField label="Workspace / brand name" value={brand.workspace_name} onChange={(value) => setBrand((form) => ({ ...form, workspace_name: value }))} />
            <EditableField label="Assistant name" value={brand.assistant_name} onChange={(value) => setBrand((form) => ({ ...form, assistant_name: value }))} />
            <EditableField label="Widget greeting" value={brand.widget_greeting} onChange={(value) => setBrand((form) => ({ ...form, widget_greeting: value }))} />
            <div className="color-row">
              <ColorSetting label="Primary colour" value={brand.primary_color} onChange={(value) => setBrand((form) => ({ ...form, primary_color: value }))} />
              <ColorSetting label="Accent colour" value={brand.accent_color} onChange={(value) => setBrand((form) => ({ ...form, accent_color: value }))} />
              <ColorSetting label="Widget background" value={brand.widget_background} onChange={(value) => setBrand((form) => ({ ...form, widget_background: value }))} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveBrandSettings} disabled={isSaving}>Save brand</button>
          </div>
          <div className="wl-preview" style={{ "--brand": brand.primary_color } as CSSProperties}><div className="wl-bar" /><div className="wl-head"><div className="wl-logo">{brand.assistant_name.slice(0, 1) || "B"}</div><span>{brand.assistant_name}</span></div><div className="wl-body"><div className="wl-msg user">How do I reset my password?</div><div className="wl-msg ai">{brand.widget_greeting}</div></div></div>
        </div>

        <div className="settings-section settings-section-wide">
          <h4>Members & roles</h4>
          <div className="member-invite-row">
            <EditableField label="Email" type="email" value={memberForm.email} onChange={(value) => setMemberForm((form) => ({ ...form, email: value }))} />
            <EditableField label="First name" value={memberForm.first_name} onChange={(value) => setMemberForm((form) => ({ ...form, first_name: value }))} />
            <EditableField label="Last name" value={memberForm.last_name} onChange={(value) => setMemberForm((form) => ({ ...form, last_name: value }))} />
            <EditableSelect label="Role" value={memberForm.role} options={["administrator", "manager", "agent", "viewer"]} onChange={(value) => setMemberForm((form) => ({ ...form, role: value as MemberRole }))} />
            <button className="btn btn-primary btn-sm" onClick={inviteMember} disabled={isSaving}>Add member</button>
          </div>
          <div className="member-list">
            {(settings?.members ?? []).map((member) => (
              <div className="member-row" key={member.id}>
                <div className="profile-avatar">{`${member.first_name || member.email[0]}${member.last_name ? member.last_name[0] : ""}`.toUpperCase()}</div>
                <div className="member-info"><strong>{member.first_name || member.last_name ? `${member.first_name} ${member.last_name}` : member.email}</strong><span>{member.email} · {member.status}</span></div>
                <select className="form-control role-select" value={member.role} onChange={(event) => changeRole(member, event.target.value as MemberRole)}>
                  {["administrator", "manager", "agent", "viewer"].map((role) => <option key={role}>{role}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Profiles() {
  return (
    <>
      <PageIntro title="Customer Profiles" body="AI-enriched profiles synced to Chatwoot contacts." />
      <div className="grid-left-heavy">
        <div>{profiles.map(([name, email, convos, topic, score]) => <div className="profile-row" key={email}><div className="profile-avatar">{name.split(" ").map((part) => part[0]).join("")}</div><div className="profile-info"><strong>{name}</strong><span>{email}: {convos}</span></div><div className="profile-topics"><span className="badge badge-brand">{topic}</span></div><div className="profile-score"><div className="ps-num">{score}</div><div className="ps-label">Score</div></div></div>)}</div>
        <Card title="Profile detail: Priya M."><p className="text-sm">Power user with strong technical background. Frequently asks about API integration, SAML setup, and authentication flows.</p><hr className="divider" /><button className="btn btn-primary btn-sm">Open in Chatwoot</button></Card>
      </div>
    </>
  );
}

function StatRow() {
  return <div className="stats-row">{stats.map(([label, value, sub, tone]) => <div className="stat-card" key={label}><div className="stat-card-top"><span className="stat-label">{label}</span><div className="stat-icon" style={{ background: `var(--${tone}-50, var(--brand-50))` }}>{label.slice(0, 2).toUpperCase()}</div></div><div className="stat-val">{value}</div><div className="stat-sub">{sub}</div></div>)}</div>;
}

function TopicCard() {
  return <Card title="Top knowledge topics"><TopicList /></Card>;
}

function TopicList() {
  return <>{topics.map(([title, count, width, color]) => <div className="kb-topic-row" key={title}><span className="kt-dot" style={{ background: color }} /><span className="kt-title">{title}</span><div className="kt-bar-wrap"><div className="kt-bar" style={{ width: `${width}%`, background: color }} /></div><span className="kt-count">{count}</span></div>)}</>;
}

function PageIntro({ title, body, action }: { title: string; body: string; action?: string }) {
  return <div className="db-page-intro"><div><h2>{title}</h2><p>{body}</p></div>{action && <button className="btn btn-primary btn-sm">{action}</button>}</div>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card"><div className="card-header"><span className="card-title">{title}</span></div>{children}</div>;
}

function MiniPanel({ title, value }: { title: string; value: string }) {
  return <div className="stat-card"><div className="stat-label">{title}</div><div className="stat-val">{value}</div></div>;
}

function EditableField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field"><span>{label}</span><input className="form-control" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function EditableSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><select className="form-control" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ColorSetting({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="color-field"><label>{label}</label><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function methodClass(method: string) {
  if (method === "GET") return "m-get";
  if (method === "POST") return "m-post";
  if (method === "PUT") return "m-put";
  return "m-delete";
}

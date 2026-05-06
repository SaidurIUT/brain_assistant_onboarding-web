import Link from "next/link";
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
  return (
    <>
      <PageIntro title="Settings & Whitelabeling" body="Workspace identity, widget appearance, and AI behavior defaults." action="Save changes" />
      <div className="settings-grid">
        <div className="settings-section"><h4>Brand identity</h4><div className="ob-form-stack"><Field label="Workspace / brand name" value="Acme Support" /><Field label="Assistant name" value="Acme Assistant" /><Field label="Widget greeting" value="Hi! I am Acme Assistant. How can I help?" /></div><div className="wl-preview"><div className="wl-bar" /><div className="wl-head"><div className="wl-logo">A</div><span>Acme Assistant</span></div><div className="wl-body"><div className="wl-msg user">How do I reset my password?</div><div className="wl-msg ai">Use Forgot password on the login page to receive a reset link.</div></div></div></div>
        <div className="settings-section"><h4>AI behavior</h4>{["Proactive greeting", "Show source citations", "Collect email before chat", "API actions enabled"].map((item) => <div className="settings-row" key={item}><div className="sr-label"><strong>{item}</strong><span>Dummy setting</span></div><label className="toggle"><input type="checkbox" defaultChecked={item !== "Collect email before chat"} /><div className="toggle-track" /></label></div>)}</div>
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

function Field({ label, value }: { label: string; value: string }) {
  return <label className="field"><span>{label}</span><input className="form-control" defaultValue={value} /></label>;
}

function methodClass(method: string) {
  if (method === "GET") return "m-get";
  if (method === "POST") return "m-post";
  if (method === "PUT") return "m-put";
  return "m-delete";
}

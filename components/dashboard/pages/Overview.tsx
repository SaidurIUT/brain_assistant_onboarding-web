import type { WorkspaceSettings } from "@/lib/auth-api";
import { stats, topics } from "@/lib/dashboard-data";
import { Card, MiniPanel } from "@/components/dashboard/shared";

export function Overview({ settings }: { settings: WorkspaceSettings }) {
  return (
    <>
      <div className="workspace-summary">
        <MiniPanel title="Organization" value={settings.company.name} />
        <MiniPanel title="Your role" value={settings.current_role} />
        <MiniPanel title="Members" value={String(settings.members.length)} />
      </div>
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

function StatRow() {
  return <div className="stats-row">{stats.map(([label, value, sub, tone]) => <div className="stat-card" key={label}><div className="stat-card-top"><span className="stat-label">{label}</span><div className="stat-icon" style={{ background: `var(--${tone}-50, var(--brand-50))` }}>{label.slice(0, 2).toUpperCase()}</div></div><div className="stat-val">{value}</div><div className="stat-sub">{sub}</div></div>)}</div>;
}

function TopicCard() {
  return <Card title="Top knowledge topics"><TopicList /></Card>;
}

function TopicList() {
  return <>{topics.map(([title, count, width, color]) => <div className="kb-topic-row" key={title}><span className="kt-dot" style={{ background: color }} /><span className="kt-title">{title}</span><div className="kt-bar-wrap"><div className="kt-bar" style={{ width: `${width}%`, background: color }} /></div><span className="kt-count">{count}</span></div>)}</>;
}

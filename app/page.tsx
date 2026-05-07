import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { Logo } from "@/components/Logo";
import { features, integrations, knowledgeSources, plans, workflowSteps } from "@/lib/marketing-data";

export default function HomePage() {
  return (
    <>
      <header className="lp-header">
        <Logo />
        <nav className="lp-nav" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <a href="#chatwoot">Chatwoot</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="lp-actions">
          <AuthNav />
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-pill"><span className="dot" />Built natively on open-source Chatwoot</div>
          <h1>Deploy an intelligent<br />AI support layer<br />in minutes.</h1>
          <p className="hero-sub">
            Brain Assistant 23 wraps Chatwoot with an AI automation engine: knowledge graph RAG,
            REST API action routing, multi-source ingestion, and smart human handoff. Fully whitelabeled for your brand.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-primary btn-lg" href="/onboarding">Start free onboarding</Link>
            <Link className="btn btn-secondary btn-lg" href="/dashboard/overview">See the dashboard</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>91%</strong><span>AI resolution rate</span></div>
            <div className="hero-stat"><strong>RAG</strong><span>Knowledge graph</span></div>
            <div className="hero-stat"><strong>1 snippet</strong><span>Embed anywhere</span></div>
            <div className="hero-stat"><strong>∞</strong><span>Source types</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Brain Assistant dashboard preview">
          <div className="dash-preview">
            <div className="dash-bar">
              <span className="dot" /><span className="dot" /><span className="dot" />
              <span className="url-bar">app.brainassistant23.com/dashboard</span>
            </div>
            <div className="dash-body">
              <div className="mini-sidebar">
                {["OV", "KB", "ST", "CW", "AC"].map((item, index) => (
                  <div className={`mini-nav ${index === 0 ? "active" : ""}`} key={item}>{item}</div>
                ))}
              </div>
              <div className="mini-main">
                <div className="mini-stats">
                  <MiniStat label="Resolved" value="847" change="up 12%" />
                  <MiniStat label="AI Rate" value="91%" change="up 3.2%" />
                  <MiniStat label="KB Entries" value="4.2k" change="up 64" />
                </div>
                <div className="mini-kb">
                  <div className="kb-head">Knowledge Base: Top Topics</div>
                  {[
                    ["#6366f1", "Pricing & Plans", "312 entries"],
                    ["#06b6d4", "API Integration", "248 entries"],
                    ["#10b981", "Authentication", "195 entries"],
                    ["#f59e0b", "Billing & Invoices", "167 entries"],
                    ["#ef4444", "Technical Errors", "143 entries"]
                  ].map(([color, title, count]) => (
                    <div className="mini-kb-row" key={title}>
                      <span className="dot" style={{ background: color }} />
                      <span className="kbt">{title}</span>
                      <span className="kbc">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mini-chat">
                <div className="mini-chat-label">Live widget</div>
                <div className="mini-bubble user">How do I connect my API?</div>
                <div className="mini-bubble ai">Go to API Configurator, paste your base URL, and select endpoints.</div>
                <div className="mini-bubble user">What about auth tokens?</div>
                <div className="mini-bubble ai">Bearer, API Key, and OAuth2 are supported.</div>
                <div className="mini-bubble hand">Handing off to agent...</div>
              </div>
            </div>
          </div>
          <div className="cw-badge">
            <div className="cw-badge-icon">CW</div>
            <div className="cw-badge-text"><strong>Powered by Chatwoot</strong><span>Fully whitelabeled and integrated</span></div>
          </div>
        </div>
      </section>

      <div className="int-bar">
        <div className="int-bar-inner">
          <p>Ingests from</p>
          <div className="int-logos">
            {integrations.map((item) => (
              <div className="int-logo" key={item.label}>
                <div className="int-icon" style={{ background: item.color }}>{item.code}</div>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="lp-section" id="features">
        <div className="lp-inner">
          <SectionHeader eyebrow="Platform" title="Everything your support team needs, AI-automated." body="Brain Assistant 23 layers an intelligence engine on top of Chatwoot, so your team keeps the inbox they know while AI handles the volume." />
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feat-card" key={feature.title}>
                <div className={`feat-icon ${feature.tone}`}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section alt" id="workflow">
        <div className="lp-inner">
          <SectionHeader eyebrow="How it works" title="From signup to live AI support in five steps." />
          <div className="workflow-wrap">
            <div className="workflow-track" />
            <div className="workflow-steps">
              {workflowSteps.map(([title, body], index) => (
                <div className="wf-step" key={title}>
                  <div className="wf-num">{String(index + 1).padStart(2, "0")}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cw-section" id="chatwoot">
        <div className="cw-inner">
          <div className="cw-copy">
            <span className="eyebrow">Chatwoot Integration</span>
            <h2>Your team&apos;s inbox.<br />AI&apos;s intelligence layer.</h2>
            <p>We do not replace Chatwoot. We supercharge it with first-line responses, enriched profiles, and full-context handoff.</p>
            <div className="cw-features">
              {["Full whitelabeling", "AI inline in agent view", "Automatic contact enrichment", "Smart assignment and routing"].map((title) => (
                <div className="cw-feat" key={title}>
                  <span className="cw-dot" />
                  <div className="cw-feat-text"><strong>{title}</strong><p>Dummy configuration is ready for the future MCP and Chatwoot integration layer.</p></div>
                </div>
              ))}
            </div>
          </div>
          <ChatwootPreview />
        </div>
      </section>

      <section className="lp-section" id="data">
        <div className="lp-inner">
          <SectionHeader eyebrow="Knowledge Ingestion" title="Connect every source. Build one unified knowledge graph." body="Every document, page, and API spec you connect is processed, chunked, embedded, and linked in a queryable graph that powers grounded AI answers." />
          <div className="sources-grid">
            {knowledgeSources.map(([title, body, code, bg]) => (
              <article className="source-item" key={title}>
                <div className="source-icon-wrap" style={{ background: bg }}><span>{code}</span></div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section alt" id="pricing">
        <div className="lp-inner">
          <SectionHeader eyebrow="Pricing" title="Simple plans. No hidden Chatwoot fees." body="Chatwoot is open-source and self-hostable. You only pay Brain Assistant 23 for the AI layer." />
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article className={`pricing-card ${plan.featured ? "featured" : ""}`} key={plan.name}>
                {plan.featured && <div className="plan-badge">Most popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">{plan.price}{plan.suffix && <span>{plan.suffix}</span>}</div>
                <p className="plan-desc">{plan.description}</p>
                <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <Link className={`btn ${plan.featured ? "btn-primary" : plan.name === "Enterprise" ? "btn-dark" : "btn-secondary"}`} href="/onboarding">{plan.cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta">
        <h2>Ready to put your support on autopilot?</h2>
        <p>Connect your content, configure your APIs, embed one snippet, and watch AI handle the rest.</p>
        <div className="cta-btns">
          <Link className="btn btn-primary btn-lg" href="/onboarding">Start onboarding</Link>
          <Link className="btn btn-secondary btn-lg" href="/dashboard/overview">Explore the dashboard</Link>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="footer-brand"><div className="logo-mark" style={{ width: 24, height: 24, fontSize: ".65rem" }}>BA</div>Brain Assistant 23</div>
        <nav><a href="#">Docs</a><a href="#">GitHub</a><a href="#">Chatwoot</a><a href="#">Privacy</a><a href="#">Status</a></nav>
        <span>© 2026 Brain Assistant 23. Open core, AI-powered.</span>
      </footer>
    </>
  );
}

function MiniStat({ label, value, change }: { label: string; value: string; change: string }) {
  return <div className="mini-stat"><div className="ms-label">{label}</div><div className="ms-val">{value}</div><div className="ms-chg">{change}</div></div>;
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return <div className="section-header"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{body && <p>{body}</p>}</div>;
}

function ChatwootPreview() {
  return (
    <div className="cw-visual">
      <div className="cw-inbox">
        <div className="cw-inbox-head"><div className="title"><span style={{ color: "#1f93ff", fontWeight: 900 }}>CW</span>Acme Support: Inbox</div><span className="ai-pill">AI active</span></div>
        <div className="cw-body">
          <div className="cw-list">
            {["Sarah K.", "James T.", "Priya M.", "Alex R."].map((name, index) => (
              <div className={`cw-list-item ${index === 0 ? "active" : ""}`} key={name}>
                <div className="cw-li-meta"><span className="cw-li-name">{name}</span><span className="cw-li-time">{index === 0 ? "2m" : `${index * 7 + 1}m`}</span></div>
                <div className="cw-li-preview">{index === 0 ? "How do I integrate my API?" : "Support automation question"}</div>
              </div>
            ))}
          </div>
          <div className="cw-chat">
            <div className="cw-msg visitor">How do I connect my REST API to the assistant?</div>
            <div className="cw-msg ai">Go to API Configurator, paste your base URL, and select which endpoints to expose.</div>
            <div className="cw-msg-meta">AI: sourced from API docs</div>
            <div className="cw-msg visitor">What if the AI cannot handle my question?</div>
            <div className="cw-handoff">AI confidence below threshold: handing off with full context</div>
            <div className="cw-msg agent">Hi Sarah, I am picking this up. Let me pull up your account.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

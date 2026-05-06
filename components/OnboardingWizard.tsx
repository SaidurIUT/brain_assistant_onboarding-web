"use client";

import Link from "next/link";
import type { CSSProperties, ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { cloudSources, onboardingSteps, reviewRows } from "@/lib/onboarding-data";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  icon: string;
};

export function OnboardingWizard() {
  const [current, setCurrent] = useState(0);
  const [logoName, setLogoName] = useState("No logo uploaded yet");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [connectedSources, setConnectedSources] = useState<Set<string>>(new Set(["gdrive"]));
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: "faq", name: "Product_FAQ.pdf", size: "284 KB", icon: "PDF" },
    { id: "pricing", name: "Pricing_Policy.docx", size: "118 KB", icon: "DOC" }
  ]);
  const [chatwootMode, setChatwootMode] = useState<"existing" | "new">("existing");

  const progress = useMemo(() => ((current + 1) / onboardingSteps.length) * 100, [current]);

  function goToStep(step: number) {
    if (step > current) return;
    setCurrent(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const nextFiles = selected.map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      return {
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        icon: ext === "pdf" ? "PDF" : ext === "csv" ? "CSV" : ext === "md" ? "MD" : "DOC"
      };
    });
    setFiles((existing) => [...existing, ...nextFiles]);
  }

  function toggleSource(sourceId: string) {
    setConnectedSources((existing) => {
      const next = new Set(existing);
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
  }

  return (
    <div className="ob-layout" style={{ "--brand": brandColor } as CSSProperties}>
      <aside className="ob-sidebar">
        <Link className="ob-brand" href="/">
          <div className="logo-mark">BA</div>
          <span>Brain Assistant 23</span>
        </Link>

        <div className="ob-sidebar-intro">
          <span className="eyebrow">Workspace setup</span>
          <h2>Build your AI support profile</h2>
          <p>Connect your brand, knowledge sources, and Chatwoot instance to go live.</p>
        </div>

        <ol className="ob-step-list">
          {onboardingSteps.map((step, index) => (
            <li
              className={`ob-step ${index === current ? "active" : ""} ${index < current ? "done" : ""}`}
              key={step.title}
              onClick={() => goToStep(index)}
            >
              <div className="step-num">{index < current ? "✓" : index + 1}</div>
              <div className="step-label"><strong>{step.title}</strong><span>{step.subtitle}</span></div>
            </li>
          ))}
        </ol>

        <div className="ob-sidebar-footer">
          <p>Need help? <a href="#">Read the docs</a></p>
        </div>
      </aside>

      <main className="ob-main">
        <div className="ob-topbar">
          <span className="prog-info">Step {current + 1} of {onboardingSteps.length}</span>
          <div className="prog-track"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="ob-content">
          <WizardPanel active={current === 0} step="Step 1 of 8" title="Tell us about your company" desc="This information sets up your workspace identity and helps train the initial knowledge base context.">
            <div className="ob-form-stack">
              <Field label="Company name"><input type="text" className="form-control" placeholder="Acme Corp" defaultValue="Acme Corp" /></Field>
              <div className="field-row">
                <Field label="Industry"><Select options={["SaaS / Software", "E-commerce", "Fintech", "Healthcare", "Other"]} /></Field>
                <Field label="Team size"><Select options={["1-5 agents", "6-20 agents", "21-100 agents", "100+ agents"]} /></Field>
              </div>
              <Field label="Brief description of your product / service"><textarea className="form-control" placeholder="We provide a project management SaaS for remote engineering teams." /></Field>
              <Field label="Primary support language"><Select options={["English", "Spanish", "French", "German", "Arabic", "Hindi", "Bangla"]} /></Field>
            </div>
          </WizardPanel>

          <WizardPanel active={current === 1} step="Step 2 of 8" title="Brand & whitelabeling" desc="Your logo and colours will be applied to the chat widget and the Chatwoot agent interface.">
            <label className="upload-zone" htmlFor="logo-input">
              <input type="file" id="logo-input" accept="image/*" onChange={handleLogoUpload} />
              <div className="uz-icon">IMG</div>
              <strong>Upload your logo</strong>
              <small>PNG, SVG, or JPG. Transparent backgrounds work best.</small>
            </label>
            <div className="logo-preview-wrap">
              <div className="logo-circle">
                {logoPreview ? (
                  // Data URL previews are user-selected local files, so Next image optimization is not useful here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Uploaded logo preview" style={{ display: "block" }} />
                ) : "BA"}
              </div>
              <div className="logo-preview-text"><p>{logoName}</p><span>Shown in widget header and agent sidebar</span></div>
            </div>
            <hr className="divider" />
            <Field label="Assistant display name"><input type="text" className="form-control" defaultValue="Acme Assistant" /></Field>
            <div className="color-row">
              <ColorField label="Primary colour" value={brandColor} onChange={setBrandColor} />
              <ColorField label="Accent colour" value="#06b6d4" />
              <ColorField label="Widget background" value="#ffffff" />
            </div>
          </WizardPanel>

          <WizardPanel active={current === 2} step="Step 3 of 8" title="Create your admin account" desc="This becomes the primary account for managing your Brain Assistant 23 workspace.">
            <div className="ob-form-stack">
              <div className="field-row"><Field label="First name"><input className="form-control" placeholder="Jane" /></Field><Field label="Last name"><input className="form-control" placeholder="Doe" /></Field></div>
              <Field label="Work email"><input className="form-control" type="email" placeholder="jane@yourcompany.com" /></Field>
              <Field label="Password"><input className="form-control" type="password" placeholder="At least 12 characters" /></Field>
              <Field label="Confirm password"><input className="form-control" type="password" placeholder="Repeat password" /></Field>
            </div>
          </WizardPanel>

          <WizardPanel active={current === 3} step="Step 4 of 8" title="Connect your website" desc="We will crawl public pages to seed the knowledge base with your existing content.">
            <div className="ob-form-stack">
              <Field label="Company website URL"><input className="form-control" type="url" placeholder="https://acme.com" defaultValue="https://acme.com" /></Field>
              <Field label="Docs / help centre URL"><input className="form-control" type="url" placeholder="https://docs.acme.com" /></Field>
            </div>
            <div className="choice-group">
              {["Full website crawl", "Selective pages", "Skip website scraping"].map((label, index) => (
                <label className="choice-option" key={label}>
                  <input type="radio" name="scrape" defaultChecked={index === 0} />
                  <div><strong>{label}</strong><small>{index === 0 ? "Scrape all reachable public pages. Typical crawl: 1-5 min." : index === 1 ? "Paste specific URLs to include." : "Rely only on uploaded documents and API docs."}</small></div>
                </label>
              ))}
            </div>
          </WizardPanel>

          <WizardPanel active={current === 4} step="Step 5 of 8" title="API documentation & actions" desc="Import your Swagger/OpenAPI spec so AI can answer technical questions and select which endpoints AI can call.">
            <div className="ob-form-stack">
              <Field label="Swagger / OpenAPI URL"><input className="form-control" type="url" placeholder="https://api.acme.com/swagger.json" /></Field>
              <Field label="API base URL"><input className="form-control" type="url" placeholder="https://api.acme.com/v1" /></Field>
              <div className="field-row"><Field label="Auth type"><Select options={["Bearer token", "API Key", "OAuth 2.0", "None"]} /></Field><Field label="Auth header / token"><input className="form-control" type="password" placeholder="sk-•••••••••••••" /></Field></div>
            </div>
            <div className="endpoint-list mt-6">
              {["GET /orders/{id}", "POST /tickets", "PUT /users/{id}", "DELETE /sessions/{id}"].map((endpoint, index) => (
                <div className={`ep-item ${index < 3 ? "selected" : ""}`} key={endpoint}>
                  <span className={`method-pill ${endpoint.startsWith("GET") ? "m-get" : endpoint.startsWith("POST") ? "m-post" : endpoint.startsWith("PUT") ? "m-put" : "m-delete"}`}>{endpoint.split(" ")[0]}</span>
                  <span className="ep-path">{endpoint.split(" ")[1]}</span>
                  <span className="ep-desc">Dummy endpoint permission</span>
                  <span className="ep-check" />
                </div>
              ))}
            </div>
          </WizardPanel>

          <WizardPanel active={current === 5} step="Step 6 of 8" title="Connect data sources" desc="Link cloud drives and upload documents to build a richer knowledge graph.">
            <div className="source-cards">
              {cloudSources.map((source) => {
                const connected = connectedSources.has(source.id);
                return (
                  <button className={`src-card ${connected ? "connected" : ""}`} key={source.id} onClick={() => toggleSource(source.id)} type="button">
                    <div className="src-icon" style={{ background: source.bg }}>{source.icon}</div>
                    <div className="src-info"><strong>{source.title}</strong><span>{connected ? `✓ ${source.connected}` : source.description}</span></div>
                  </button>
                );
              })}
            </div>
            <label className="upload-zone" htmlFor="docs-upload">
              <input type="file" id="docs-upload" multiple accept=".pdf,.docx,.md,.txt,.csv" onChange={handleFileUpload} />
              <div className="uz-icon">DOC</div>
              <strong>Upload knowledge documents</strong>
              <small>FAQs, manuals, pricing sheets, policy docs, onboarding guides.</small>
            </label>
            <div className="file-list">
              {files.map((file) => (
                <div className="file-item" key={file.id}>
                  <span className="fi-icon">{file.icon}</span><span className="fi-name">{file.name}</span><span className="fi-size">{file.size}</span>
                  <button className="fi-rm" type="button" onClick={() => setFiles((existing) => existing.filter((item) => item.id !== file.id))}>×</button>
                </div>
              ))}
            </div>
          </WizardPanel>

          <WizardPanel active={current === 6} step="Step 7 of 8" title="Connect Chatwoot" desc="Brain Assistant 23 works alongside Chatwoot. Connect an existing installation or let us provision a new one.">
            <div className="cw-opts">
              <button className={`cw-opt ${chatwootMode === "existing" ? "selected" : ""}`} type="button" onClick={() => setChatwootMode("existing")}><div className="opt-icon">CW</div><strong>Use existing Chatwoot</strong><small>Connect self-hosted or cloud Chatwoot with an API key.</small></button>
              <button className={`cw-opt ${chatwootMode === "new" ? "selected" : ""}`} type="button" onClick={() => setChatwootMode("new")}><div className="opt-icon">NEW</div><strong>Provision new instance</strong><small>Set up a Chatwoot Cloud instance and link it automatically.</small></button>
            </div>
            {chatwootMode === "existing" ? (
              <div className="ob-form-stack">
                <Field label="Chatwoot instance URL"><input className="form-control" type="url" placeholder="https://chatwoot.yourcompany.com" /></Field>
                <Field label="API access token"><input className="form-control" type="password" placeholder="Paste your Chatwoot user access token" /></Field>
                <Field label="Default inbox name"><input className="form-control" placeholder="Website Support" /></Field>
                <ToggleCopy title="Enable full whitelabeling" body="Apply your brand colours and logo to the Chatwoot agent interface" />
              </div>
            ) : (
              <div className="ob-form-stack">
                <Field label="Subdomain"><input className="form-control" placeholder="acme" /></Field>
                <div className="info-box">We will provision your Chatwoot instance, apply your brand, and connect it automatically. This takes about 2 minutes.</div>
              </div>
            )}
          </WizardPanel>

          <WizardPanel active={current === 7} step="Step 8 of 8" title="Review & launch" desc="Everything looks good. Here is what your workspace is configured with.">
            <ReviewBlock title="Company" rows={reviewRows.company} />
            <ReviewBlock title="Knowledge Sources" rows={reviewRows.sources} ok />
            <ReviewBlock title="Chatwoot" rows={reviewRows.chatwoot} ok />
            <div className="review-block">
              <h4>Embed snippet</h4>
              <p className="text-sm">Paste this in your website head to activate the widget.</p>
              <pre className="snippet-preview">{`<!-- Brain Assistant 23 Widget -->
<script
  src="https://cdn.brainassistant23.com/widget.js"
  data-workspace="ws_acme_corp_xk92"
  data-brand="${brandColor}">
</script>`}</pre>
            </div>
          </WizardPanel>
        </div>

        <div className="ob-actions">
          <span className="step-indicator">Step {current + 1} of {onboardingSteps.length}</span>
          <div className="ob-action-buttons">
            {current > 0 && <button className="btn btn-secondary" onClick={() => setCurrent((step) => Math.max(0, step - 1))}>Back</button>}
            {current < onboardingSteps.length - 1 ? <button className="btn btn-primary" onClick={() => setCurrent((step) => Math.min(onboardingSteps.length - 1, step + 1))}>Continue</button> : <Link className="btn btn-success" href="/dashboard/overview">Launch workspace</Link>}
          </div>
        </div>
      </main>
    </div>
  );
}

function WizardPanel({ active, step, title, desc, children }: { active: boolean; step: string; title: string; desc: string; children: React.ReactNode }) {
  return <section className={`ob-panel ${active ? "active" : ""}`}><p className="step-tag">{step}</p><h3>{title}</h3><p className="step-desc">{desc}</p>{children}</section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Select({ options }: { options: string[] }) {
  return <select className="form-control">{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange?: (value: string) => void }) {
  return <div className="color-field"><label>{label}</label><input type="color" defaultValue={value} onChange={(event) => onChange?.(event.target.value)} /></div>;
}

function ToggleCopy({ title, body }: { title: string; body: string }) {
  return <div className="toggle-copy"><label className="toggle"><input type="checkbox" defaultChecked /><div className="toggle-track" /></label><div><strong>{title}</strong><p>{body}</p></div></div>;
}

function ReviewBlock({ title, rows, ok = false }: { title: string; rows: string[][]; ok?: boolean }) {
  return <div className="review-block"><h4>{title}</h4>{rows.map(([key, value]) => <div className="review-row" key={key}><span className="rk">{key}</span><span className={`rv ${ok ? "ok" : ""}`}>{ok ? "✓ " : ""}{value}</span></div>)}</div>;
}

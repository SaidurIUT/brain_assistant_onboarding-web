"use client";

import Link from "next/link";
import type { CSSProperties, ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { AuthNav } from "@/components/AuthNav";
import { PasswordField, passwordMeetsRequirements } from "@/components/PasswordField";
import {
  AuthApiError,
  type AuthUser,
  getStoredAccessToken,
  getStoredUser,
  getCurrentUser,
  isKeycloakAuthEnabled,
  refreshSession,
  register,
  startKeycloakLogin,
  storeAuth,
  updateBrandSettings,
  updateCompanySettings
} from "@/lib/auth-api";
import { cloudSources, onboardingSteps, reviewRows } from "@/lib/onboarding-data";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  icon: string;
};

type CompanyForm = {
  companyName: string;
  industry: string;
  teamSize: string;
  description: string;
  language: string;
};

type AdminForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function OnboardingWizard() {
  const [current, setCurrent] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyForm>({
    companyName: "",
    industry: "Other",
    teamSize: "1-5 agents",
    description: "",
    language: "English"
  });
  const [admin, setAdmin] = useState<AdminForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [logoName, setLogoName] = useState("No logo uploaded yet");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [connectedSources, setConnectedSources] = useState<Set<string>>(new Set(["gdrive"]));
  const [apiAuthToken, setApiAuthToken] = useState("");
  const [chatwootToken, setChatwootToken] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: "faq", name: "Product_FAQ.pdf", size: "284 KB", icon: "PDF" },
    { id: "pricing", name: "Pricing_Policy.docx", size: "118 KB", icon: "DOC" }
  ]);
  const [chatwootMode, setChatwootMode] = useState<"existing" | "new">("existing");

  const progress = useMemo(() => ((current + 1) / onboardingSteps.length) * 100, [current]);
  const accountRows = useMemo(
    () => [
      ["Admin", authUser ? `${authUser.first_name} ${authUser.last_name}` : "Not created"],
      ["Email", authUser?.email ?? (admin.email || "Not set")],
      ["Company name", company.companyName || "Default workspace"],
      ["Industry", company.industry],
      ["Team size", company.teamSize]
    ],
    [admin.email, authUser, company]
  );

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getStoredAccessToken();
    if (!storedUser || !storedToken) return;

    setAuthUser(storedUser);
    setHighestStep(onboardingSteps.length - 1);

    getCurrentUser(storedToken)
      .then((user) => setAuthUser(user))
      .catch(async () => {
        try {
          const refreshed = await refreshSession();
          storeAuth(refreshed);
          setAuthUser(refreshed.user);
        } catch {
          setAuthUser(null);
          setHighestStep(0);
        }
      });
  }, []);

  function goToStep(step: number) {
    if (step > highestStep) return;
    setCurrent(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCompany<K extends keyof CompanyForm>(field: K, value: CompanyForm[K]) {
    setCompany((existing) => ({ ...existing, [field]: value }));
  }

  function updateAdmin<K extends keyof AdminForm>(field: K, value: AdminForm[K]) {
    setAdmin((existing) => ({ ...existing, [field]: value }));
    if ((field === "email" || field === "password") && existingAccountEmail) {
      setExistingAccountEmail(null);
      setAuthError(null);
    }
  }

  async function handleNext() {
    setStatusMessage(null);
    if (current === 0 && !authUser) {
      const created = await createAdminAccount();
      if (!created) return;
    }
    if (current === 1 && authUser) {
      const saved = await saveCompanyDetails();
      if (!saved) return;
    }
    if (current === 2 && authUser) {
      const saved = await saveBrandDetails();
      if (!saved) return;
    }

    const nextStep = Math.min(onboardingSteps.length - 1, current + 1);
    setHighestStep((step) => Math.max(step, nextStep));
    setCurrent(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createAdminAccount() {
    if (isKeycloakAuthEnabled()) {
      setIsSubmitting(true);
      setAuthError(null);
      try {
        await startKeycloakLogin("/onboarding");
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : "Could not start Keycloak sign-in.");
        setIsSubmitting(false);
      }
      return false;
    }

    const validationError = validateFirstStep();
    if (validationError) {
      setAuthError(validationError);
      return false;
    }

    setIsSubmitting(true);
    setAuthError(null);
    setExistingAccountEmail(null);

    try {
      const auth = await register({
        email: admin.email,
        first_name: admin.firstName,
        last_name: admin.lastName,
        password: admin.password,
        confirm_password: admin.confirmPassword
      });
      storeAuth(auth);
      setAuthUser(auth.user);
      setStatusMessage(
        auth.user.email_verified
          ? "Account ready."
          : "Account ready. Check the verification email before inviting team members."
      );
      return true;
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        setExistingAccountEmail(admin.email.trim());
        setAuthError("That email already belongs to an account. Use its existing password to continue, or sign in.");
      } else {
        setAuthError(error instanceof Error ? error.message : "Could not create the account.");
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function validateFirstStep() {
    if (!admin.firstName.trim()) return "First name is required.";
    if (!admin.lastName.trim()) return "Last name is required.";
    if (!admin.email.trim()) return "Email is required.";
    if (!passwordMeetsRequirements(admin.password)) return "Password must be at least 8 characters and include lowercase, uppercase, number, and symbol.";
    if (admin.password !== admin.confirmPassword) return "Passwords do not match.";
    return null;
  }

  function existingAccountLoginHref() {
    const params = new URLSearchParams({ next: "/onboarding" });
    if (existingAccountEmail) params.set("email", existingAccountEmail);
    return `/login?${params.toString()}`;
  }

  async function saveCompanyDetails() {
    setIsSubmitting(true);
    try {
      const saved = await updateCompanySettings({
        name: company.companyName.trim() || "Untitled company",
        industry: company.industry,
        team_size: company.teamSize,
        description: company.description,
        primary_language: company.language
      });
      setCompany({
        companyName: saved.name,
        industry: saved.industry,
        teamSize: saved.team_size,
        description: saved.description,
        language: saved.primary_language
      });
      setStatusMessage("Company settings saved.");
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Company details were not saved.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveBrandDetails() {
    setIsSubmitting(true);
    try {
      await updateBrandSettings({
        workspace_name: company.companyName.trim() || "Brain Assistant Workspace",
        assistant_name: `${company.companyName.trim() || "Brain"} Assistant`,
        widget_greeting: "Hi! I am your Brain Assistant. How can I help?",
        primary_color: brandColor,
        accent_color: "#06b6d4",
        widget_background: "#ffffff",
        logo_url: ""
      });
      setStatusMessage("Brand defaults saved.");
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Brand details were not saved.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
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
              className={`ob-step ${index === current ? "active" : ""} ${index < highestStep ? "done" : ""} ${index > highestStep ? "locked" : ""}`}
              key={step.title}
              onClick={() => goToStep(index)}
            >
              <div className="step-num">{index < highestStep ? "✓" : index + 1}</div>
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
          <AuthNav variant="onboarding" />
          <div className="prog-track"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="ob-content">
          <WizardPanel active={current === 0} step={`Step 1 of ${onboardingSteps.length}`} title="Create your administrator account" desc="This is the only mandatory onboarding step. You will be the workspace administrator.">
            <div className="ob-form-stack">
              {statusMessage ? <div className="form-alert success">{statusMessage}</div> : null}
              {authUser ? (
                <div className="form-alert success">
                  Signed in as {authUser.first_name} {authUser.last_name} ({authUser.email}).
                </div>
              ) : null}
              {authError ? (
                <div className="form-alert error">
                  <span>{authError}</span>
                  {existingAccountEmail ? (
                    <div className="form-alert-actions">
                      <Link href={existingAccountLoginHref()}>Log in instead</Link>
                      <Link href="/forgot-password">Reset password</Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {!authUser && isKeycloakAuthEnabled() ? (
                <button className="btn btn-primary w-full justify-center" type="button" onClick={createAdminAccount} disabled={isSubmitting}>
                  {isSubmitting ? "Opening Keycloak..." : "Continue with Keycloak"}
                </button>
              ) : null}
              {!authUser && !isKeycloakAuthEnabled() ? (
                <>
                  <div className="field-row"><Field label="First name"><input className="form-control" placeholder="Jane" value={admin.firstName} onChange={(event) => updateAdmin("firstName", event.target.value)} required /></Field><Field label="Last name"><input className="form-control" placeholder="Doe" value={admin.lastName} onChange={(event) => updateAdmin("lastName", event.target.value)} required /></Field></div>
                  <Field label="Email"><input className="form-control" type="email" placeholder="jane@yourcompany.com" value={admin.email} onChange={(event) => updateAdmin("email", event.target.value)} required /></Field>
                  <PasswordField label="Password" minLength={8} placeholder="At least 8 characters" value={admin.password} onChange={(value) => updateAdmin("password", value)} showRequirements required />
                  <PasswordField label="Confirm password" minLength={8} placeholder="Repeat password" value={admin.confirmPassword} onChange={(value) => updateAdmin("confirmPassword", value)} required />
                </>
              ) : null}
            </div>
          </WizardPanel>

          <WizardPanel active={current === 1} step={`Step 2 of ${onboardingSteps.length}`} title="Tell us about your company" desc="Optional for now. We created a default workspace, and you can edit these details later in Settings.">
            <div className="ob-form-stack">
              {statusMessage ? <div className="form-alert success">{statusMessage}</div> : null}
              {authError ? <div className="form-alert error">{authError}</div> : null}
              <Field label="Company name"><input type="text" className="form-control" placeholder="Acme Corp" value={company.companyName} onChange={(event) => updateCompany("companyName", event.target.value)} required /></Field>
              <div className="field-row">
                <Field label="Industry"><Select value={company.industry} onChange={(value) => updateCompany("industry", value)} options={["SaaS / Software", "E-commerce", "Fintech", "Healthcare", "Other"]} /></Field>
                <Field label="Team size"><Select value={company.teamSize} onChange={(value) => updateCompany("teamSize", value)} options={["1-5 agents", "6-20 agents", "21-100 agents", "100+ agents"]} /></Field>
              </div>
              <Field label="Brief description of your product / service"><textarea className="form-control" placeholder="We provide a project management SaaS for remote engineering teams." value={company.description} onChange={(event) => updateCompany("description", event.target.value)} /></Field>
              <Field label="Primary support language"><Select value={company.language} onChange={(value) => updateCompany("language", value)} options={["English", "Spanish", "French", "German", "Arabic", "Hindi", "Bangla"]} /></Field>
            </div>
          </WizardPanel>

          <WizardPanel active={current === 2} step={`Step 3 of ${onboardingSteps.length}`} title="Brand & whitelabeling" desc="You can skip this for now. Default Brain Assistant branding will be used until you edit it later.">
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

          <WizardPanel active={current === 3} step={`Step 4 of ${onboardingSteps.length}`} title="Connect your website" desc="Optional for now. We will keep default website settings until the backend ingestion layer is added.">
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

          <WizardPanel active={current === 4} step={`Step 5 of ${onboardingSteps.length}`} title="API documentation & actions" desc="Optional for now. You can add Swagger/OpenAPI configuration later from the dashboard.">
            <div className="ob-form-stack">
              <Field label="Swagger / OpenAPI URL"><input className="form-control" type="url" placeholder="https://api.acme.com/swagger.json" /></Field>
              <Field label="API base URL"><input className="form-control" type="url" placeholder="https://api.acme.com/v1" /></Field>
              <div className="field-row"><Field label="Auth type"><Select options={["Bearer token", "API Key", "OAuth 2.0", "None"]} /></Field><PasswordField label="Auth header / token" placeholder="Paste API credential" value={apiAuthToken} onChange={setApiAuthToken} /></div>
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

          <WizardPanel active={current === 5} step={`Step 6 of ${onboardingSteps.length}`} title="Connect data sources" desc="Optional for now. Default knowledge-source records will come in the next backend phase.">
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

          <WizardPanel active={current === 6} step={`Step 7 of ${onboardingSteps.length}`} title="Connect Chatwoot" desc="Optional for now. You can connect an existing Chatwoot instance after auth-backed workspace setup is complete.">
            <div className="cw-opts">
              <button className={`cw-opt ${chatwootMode === "existing" ? "selected" : ""}`} type="button" onClick={() => setChatwootMode("existing")}><div className="opt-icon">CW</div><strong>Use existing Chatwoot</strong><small>Connect self-hosted or cloud Chatwoot with an API key.</small></button>
              <button className={`cw-opt ${chatwootMode === "new" ? "selected" : ""}`} type="button" onClick={() => setChatwootMode("new")}><div className="opt-icon">NEW</div><strong>Provision new instance</strong><small>Set up a Chatwoot Cloud instance and link it automatically.</small></button>
            </div>
            {chatwootMode === "existing" ? (
              <div className="ob-form-stack">
                <Field label="Chatwoot instance URL"><input className="form-control" type="url" placeholder="https://chatwoot.yourcompany.com" /></Field>
                <PasswordField label="API access token" placeholder="Paste your Chatwoot user access token" value={chatwootToken} onChange={setChatwootToken} />
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

          <WizardPanel active={current === 7} step={`Step 8 of ${onboardingSteps.length}`} title="Review & launch" desc="Your admin account is connected to this workspace. Optional setup can be edited later.">
            <ReviewBlock title="Account" rows={accountRows} />
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
            {current < onboardingSteps.length - 1 ? <button className="btn btn-primary" onClick={handleNext} disabled={isSubmitting}>{current === 0 && !authUser ? isKeycloakAuthEnabled() ? isSubmitting ? "Opening Keycloak..." : "Continue with Keycloak" : isSubmitting ? "Creating account..." : "Create account" : current === 1 || current === 2 ? isSubmitting ? "Saving..." : "Save & continue" : "Skip for now"}</button> : <Link className="btn btn-success" href="/dashboard/overview">Launch workspace</Link>}
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

function Select({ options, value, onChange }: { options: string[]; value?: string; onChange?: (value: string) => void }) {
  return <select className="form-control" value={value} onChange={(event) => onChange?.(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>;
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

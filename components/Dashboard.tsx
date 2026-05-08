"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, CSSProperties } from "react";
import { useEffect, useState } from "react";
import { AuthNav } from "@/components/AuthNav";
import { PasswordField, passwordMeetsRequirements } from "@/components/PasswordField";
import type {
  ApiConfigurator as ApiConfiguratorState,
  ApiDocumentationSource,
  ApiEndpoint,
  ApiServerDetail,
  BrandSettings,
  CompanyMember,
  CompanySettings,
  MemberRole,
  WorkspaceSettings
} from "@/lib/auth-api";
import {
  addApiEndpoint,
  addMember,
  changePassword,
  clearStoredAuth,
  createApiServer,
  getApiConfigurator,
  getApiServer,
  getWorkspaceSettings,
  importApiDocumentation,
  updateApiEndpoint,
  updateApiServer,
  updateBrandSettings,
  updateCompanySettings,
  updateMemberRole,
  updateUserName
} from "@/lib/auth-api";
import {
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
  apiServerId?: string;
};

type EndpointFormState = {
  method: string;
  path: string;
  summary: string;
  description: string;
  operation_id: string;
  auth_required: boolean;
  auth_type: string;
  is_accessible_to_ai: boolean;
  parameters: EndpointParameterForm[];
  body_fields: EndpointParameterForm[];
  responses: EndpointResponseForm[];
};

type EndpointParameterForm = {
  name: string;
  location: string;
  type: string;
  required: boolean;
  description: string;
};

type EndpointResponseForm = {
  status: string;
  description: string;
};

const emptyEndpointForm: EndpointFormState = {
  method: "GET",
  path: "",
  summary: "",
  description: "",
  operation_id: "",
  auth_required: true,
  auth_type: "Bearer token",
  is_accessible_to_ai: false,
  parameters: [],
  body_fields: [],
  responses: []
};

const authTypeOptions = ["Bearer token", "API key", "OAuth 2.0", "Basic auth", "Cookie/session", "Custom header", "None"];

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

export function Dashboard({ slug, apiServerId }: DashboardProps) {
  const title = dashboardTitles[slug];
  const router = useRouter();
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const selectedCompanyId = window.localStorage.getItem("brain_assistant_company_id") ?? undefined;
    getWorkspaceSettings(selectedCompanyId)
      .then((data) => {
        setSettings(data);
        window.localStorage.setItem("brain_assistant_company_id", data.company.id);
      })
      .catch(() => {
        clearStoredAuth();
        router.replace(`/login?next=/dashboard/${slug}`);
      })
      .finally(() => setIsLoading(false));
  }, [router, slug]);

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

  if (isLoading && !settings) {
    return <div className="dashboard-loading">Loading your workspace...</div>;
  }

  if (!settings) return null;

  const userInitials = initials(settings.user.first_name, settings.user.last_name, settings.user.email);
  const userName = `${settings.user.first_name} ${settings.user.last_name}`.trim() || settings.user.email;

  return (
    <div className="db-layout">
      <aside className="db-sidebar">
        <Link className="db-brand" href="/">
          <div className="logo-mark">BA</div>
          <div className="db-brand-text"><strong>{settings.company.name}</strong><span>Brain Assistant 23</span></div>
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
            <div className="db-avatar">{userInitials}</div>
            <div className="db-user-info"><strong>{userName}</strong><span>{settings.current_role}: {settings.company.name}</span></div>
          </div>
        </div>
      </aside>

      <div className="db-main">
        <header className="db-topbar">
          <span className="page-title">{title}</span>
          <div className="db-topbar-right">
            <div className="search-box">Search knowledge base...</div>
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
            <button className="btn btn-secondary btn-sm notification-dot">Alerts</button>
            <Link className="btn btn-primary btn-sm" href="/onboarding">New workspace</Link>
            <AuthNav variant="dashboard" />
          </div>
        </header>
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
  if (slug === "knowledge-base") return <KnowledgeBase />;
  if (slug === "data-sources") return <DataSources />;
  if (slug === "data-inconsistency") return <DataInconsistency />;
  if (slug === "insights") return <Insights />;
  if (slug === "system-prompt") return <SystemPrompt />;
  if (slug === "chatwoot") return <Chatwoot />;
  if (slug === "settings") return <Settings initialSettings={settings} onSettingsChange={onSettingsChange} />;
  return <Profiles />;
}

function Overview({ settings }: { settings: WorkspaceSettings }) {
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

function ApiConfigurator({ companyId, serverId }: { companyId: string; serverId?: string }) {
  const router = useRouter();
  const [config, setConfig] = useState<ApiConfiguratorState>({ servers: [] });
  const [serverConfig, setServerConfig] = useState<ApiServerDetail | null>(null);
  const [serverName, setServerName] = useState("");
  const [serverDescription, setServerDescription] = useState("");
  const [backendBaseUrl, setBackendBaseUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceBaseUrl, setSourceBaseUrl] = useState("");
  const [sourceDocumentText, setSourceDocumentText] = useState("");
  const [sourceDocumentName, setSourceDocumentName] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [manualEndpoint, setManualEndpoint] = useState<EndpointFormState>(emptyEndpointForm);
  const [expandedEndpointId, setExpandedEndpointId] = useState<string | null>(null);
  const [editingEndpointId, setEditingEndpointId] = useState<string | null>(null);
  const [editEndpoint, setEditEndpoint] = useState<EndpointFormState>(emptyEndpointForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (serverId) {
      getApiServer(serverId, companyId)
        .then(applyServerConfig)
        .catch((err) => setError(err instanceof Error ? err.message : "Could not load API server."))
        .finally(() => setIsLoading(false));
      return;
    }
    setServerConfig(null);
    getApiConfigurator(companyId)
      .then((data) => {
        setConfig(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load API configuration."))
      .finally(() => setIsLoading(false));
  }, [companyId, serverId]);

  function applyServerConfig(data: ApiServerDetail) {
    setServerConfig(data);
    setServerName(data.server.name);
    setServerDescription(data.server.description);
    setBackendBaseUrl(data.server.base_url);
  }

  async function createServerConfiguration() {
    if (!serverName.trim()) {
      setError("Server name is required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const nextConfig = await createApiServer({
        name: serverName.trim(),
        description: serverDescription.trim(),
        base_url: backendBaseUrl.trim(),
        source_url: sourceUrl.trim(),
        document_text: sourceDocumentText,
        document_name: sourceDocumentName,
        source_type: "openapi"
      }, companyId);
      router.push(`/dashboard/api-configurator/${nextConfig.server.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create API server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveServerSettings() {
    if (!serverConfig) return;
    if (!serverName.trim()) {
      setError("Server name is required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const nextConfig = await updateApiServer(serverConfig.server.id, {
        name: serverName.trim(),
        description: serverDescription.trim(),
        base_url: backendBaseUrl.trim()
      }, companyId);
      applyServerConfig(nextConfig);
      setNotice("Server configuration saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save server configuration.");
    } finally {
      setIsSaving(false);
    }
  }

  async function importDocumentation() {
    if (!sourceUrl.trim() && !sourceDocumentText) {
      setError("Swagger/OpenAPI URL or uploaded API document is required.");
      return;
    }
    if (!serverConfig) return;
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const importBaseUrl = sourceBaseUrl.trim() || backendBaseUrl.trim();
      const nextConfig = await importApiDocumentation(serverConfig.server.id, {
        source_url: sourceUrl.trim(),
        base_url: importBaseUrl,
        document_text: sourceDocumentText,
        document_name: sourceDocumentName
      }, companyId);
      applyServerConfig(nextConfig);
      setSourceUrl("");
      setSourceBaseUrl("");
      setSourceDocumentText("");
      setSourceDocumentName("");
      setSelectedSourceId(nextConfig.sources[0]?.id ?? null);
      setNotice(`Imported ${nextConfig.endpoints.length} endpoints.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import API documentation.");
    } finally {
      setIsSaving(false);
    }
  }

  async function loadApiDocumentFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSourceDocumentName(file.name);
    setSourceDocumentText(await file.text());
  }

  async function addManualEndpoint() {
    if (!manualEndpoint.path.trim()) {
      setError("Endpoint path is required.");
      return;
    }
    if (!serverConfig) return;
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const endpoint = await addApiEndpoint(serverConfig.server.id, {
        method: manualEndpoint.method,
        path: manualEndpoint.path.trim(),
        summary: manualEndpoint.summary.trim(),
        description: manualEndpoint.description.trim(),
        operation_id: manualEndpoint.operation_id.trim(),
        auth_type: manualEndpoint.auth_required ? manualEndpoint.auth_type.trim() : "",
        auth_required: manualEndpoint.auth_required,
        is_accessible_to_ai: manualEndpoint.is_accessible_to_ai,
        parameters: parametersPayload(manualEndpoint.parameters),
        request_body: requestBodyPayload(manualEndpoint.body_fields),
        responses: responsesPayload(manualEndpoint.responses)
      }, companyId);
      setServerConfig((existing) => existing ? ({
        ...existing,
        server: { ...existing.server, endpoint_count: existing.endpoints.some((item) => item.id === endpoint.id) ? existing.server.endpoint_count : existing.server.endpoint_count + 1 },
        endpoints: [...existing.endpoints.filter((item) => item.id !== endpoint.id), endpoint]
      }) : existing);
      setExpandedEndpointId(endpoint.id);
      setEditingEndpointId(null);
      setManualEndpoint(emptyEndpointForm);
      setNotice("Endpoint added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add endpoint.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleAiAccess(endpoint: ApiEndpoint) {
    if (!serverConfig) return;
    const nextValue = !endpoint.is_accessible_to_ai;
    setServerConfig((existing) => existing ? ({
      ...existing,
      endpoints: existing.endpoints.map((item) => item.id === endpoint.id ? { ...item, is_accessible_to_ai: nextValue } : item)
    }) : existing);
    try {
      const updated = await updateApiEndpoint(serverConfig.server.id, endpoint.id, { is_accessible_to_ai: nextValue }, companyId);
      setServerConfig((existing) => existing ? ({
        ...existing,
        endpoints: existing.endpoints.map((item) => item.id === updated.id ? updated : item)
      }) : existing);
    } catch (err) {
      setServerConfig((existing) => existing ? ({
        ...existing,
        endpoints: existing.endpoints.map((item) => item.id === endpoint.id ? endpoint : item)
      }) : existing);
      setError(err instanceof Error ? err.message : "Could not update AI access.");
    }
  }

  function startEditingEndpoint(endpoint: ApiEndpoint) {
    setExpandedEndpointId(endpoint.id);
    setEditingEndpointId(endpoint.id);
    setEditEndpoint(endpointToForm(endpoint));
  }

  async function saveEndpointEdit(endpoint: ApiEndpoint) {
    if (!editEndpoint.path.trim()) {
      setError("Endpoint path is required.");
      return;
    }
    if (!serverConfig) return;
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateApiEndpoint(serverConfig.server.id, endpoint.id, {
        method: editEndpoint.method,
        path: editEndpoint.path.trim(),
        summary: editEndpoint.summary.trim(),
        description: editEndpoint.description.trim(),
        operation_id: editEndpoint.operation_id.trim(),
        auth_required: editEndpoint.auth_required,
        auth_type: editEndpoint.auth_required ? editEndpoint.auth_type.trim() : "",
        is_accessible_to_ai: editEndpoint.is_accessible_to_ai,
        parameters: parametersPayload(editEndpoint.parameters),
        request_body: requestBodyPayload(editEndpoint.body_fields),
        responses: responsesPayload(editEndpoint.responses)
      }, companyId);
      setServerConfig((existing) => existing ? ({
        ...existing,
        endpoints: existing.endpoints.map((item) => item.id === updated.id ? updated : item)
      }) : existing);
      setEditingEndpointId(null);
      setExpandedEndpointId(updated.id);
      setNotice("Endpoint updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update endpoint.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!serverId) {
    return (
      <>
        <PageIntro title="API Configurator" body="Create a backend server configuration before adding endpoints for MCP access." />
        {notice ? <div className="form-alert success mb-4">{notice}</div> : null}
        {error ? <div className="form-alert error mb-4">{error}</div> : null}

        {config.servers.length > 0 ? (
          <div className="settings-section mb-4">
            <h4>Backend servers</h4>
            <div className="api-server-grid">
              {config.servers.map((server) => (
                <Link className="api-server-card" href={`/dashboard/api-configurator/${server.id}`} key={server.id}>
                  <strong>{server.name}</strong>
                  <span>{server.base_url || "No base URL saved"}</span>
                  <div>
                    <span className="badge badge-green">{server.endpoint_count} endpoints</span>
                    <span className="badge badge-amber">{server.source_count} docs</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="settings-section">
          <h4>{config.servers.length > 0 ? "Add another server API configuration" : "Add server API configuration"}</h4>
          <div className="ob-form-stack">
            <div className="field-row">
              <label className="field">
                <span>Server name</span>
                <input className="form-control" placeholder="Billing backend" value={serverName} onChange={(event) => setServerName(event.target.value)} />
              </label>
              <label className="field">
                <span>Backend base URL</span>
                <input className="form-control" type="url" placeholder="https://api.yourcompany.com/v1" value={backendBaseUrl} onChange={(event) => setBackendBaseUrl(event.target.value)} />
              </label>
            </div>
            <label className="field">
              <span>Server details</span>
              <textarea className="form-control" placeholder="Production billing APIs" value={serverDescription} onChange={(event) => setServerDescription(event.target.value)} />
            </label>
            <label className="field">
              <span>Swagger / OpenAPI URL</span>
              <input className="form-control" type="url" placeholder="http://localhost:8010/openapi.json" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
            </label>
            <label className="field">
              <span>Upload API document</span>
              <input className="form-control" type="file" accept=".json,.yaml,.yml,application/json,text/yaml,text/x-yaml" onChange={loadApiDocumentFile} />
            </label>
            {sourceDocumentName ? <div className="field-hint">Selected: {sourceDocumentName}</div> : null}
            <button className="btn btn-primary btn-sm" onClick={createServerConfiguration} disabled={isSaving || isLoading}>Create server configuration</button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading && !serverConfig) {
    return <div className="dashboard-loading">Loading API server...</div>;
  }

  if (!serverConfig) {
    return (
      <>
        <PageIntro title="API Configurator" body="Create and manage backend server API configurations." />
        {error ? <div className="form-alert error mb-4">{error}</div> : null}
        <Link className="btn btn-secondary btn-sm" href="/dashboard/api-configurator">Back to servers</Link>
      </>
    );
  }

  const aiEnabledCount = serverConfig.endpoints.filter((endpoint) => endpoint.is_accessible_to_ai).length;
  const authRequiredCount = serverConfig.endpoints.filter((endpoint) => endpoint.auth_required).length;
  const selectedSource = serverConfig.sources.find((source) => source.id === selectedSourceId) ?? serverConfig.sources[0] ?? null;

  return (
    <>
      <PageIntro title={serverConfig.server.name} body="Configure this backend server, its API documentation, endpoints, auth behavior, and AI access." />
      {notice ? <div className="form-alert success mb-4">{notice}</div> : null}
      {error ? <div className="form-alert error mb-4">{error}</div> : null}

      <div className="api-server-actions mb-4">
        <Link className="btn btn-secondary btn-sm" href="/dashboard/api-configurator">All servers</Link>
        <Link className="btn btn-primary btn-sm" href="/dashboard/api-configurator">Add another server</Link>
      </div>

      <div className="settings-section mb-4">
        <h4>Server configuration</h4>
        <div className="ob-form-stack">
          <div className="field-row">
            <label className="field">
              <span>Server name</span>
              <input className="form-control" value={serverName} onChange={(event) => setServerName(event.target.value)} />
            </label>
            <label className="field">
              <span>Backend base URL</span>
              <input className="form-control" type="url" value={backendBaseUrl} onChange={(event) => setBackendBaseUrl(event.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Server details</span>
            <textarea className="form-control" value={serverDescription} onChange={(event) => setServerDescription(event.target.value)} />
          </label>
          <button className="btn btn-primary btn-sm" onClick={saveServerSettings} disabled={isSaving}>Save server configuration</button>
        </div>
      </div>

      <div className="api-config-grid">
        <div className="settings-section">
          <h4>Import documentation</h4>
          <div className="ob-form-stack">
            <label className="field">
              <span>Swagger / OpenAPI URL</span>
              <input className="form-control" type="url" placeholder="http://localhost:8010/openapi.json" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
            </label>
            <label className="field">
              <span>Upload API document</span>
              <input className="form-control" type="file" accept=".json,.yaml,.yml,application/json,text/yaml,text/x-yaml" onChange={loadApiDocumentFile} />
            </label>
            {sourceDocumentName ? <div className="field-hint">Selected: {sourceDocumentName}</div> : null}
            <label className="field">
              <span>Base URL</span>
              <input className="form-control" type="url" placeholder={backendBaseUrl || "https://api.yourcompany.com/v1"} value={sourceBaseUrl} onChange={(event) => setSourceBaseUrl(event.target.value)} />
            </label>
            <button className="btn btn-primary btn-sm" onClick={importDocumentation} disabled={isSaving}>Import endpoints</button>
          </div>
        </div>

        <div className="settings-section">
          <h4>Add endpoint manually</h4>
          <div className="ob-form-stack">
            <div className="field-row">
              <label className="field">
                <span>Method</span>
                <select className="form-control" value={manualEndpoint.method} onChange={(event) => setManualEndpoint((form) => ({ ...form, method: event.target.value }))}>
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => <option key={method}>{method}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Path</span>
                <input className="form-control" placeholder="/orders/{id}" value={manualEndpoint.path} onChange={(event) => setManualEndpoint((form) => ({ ...form, path: event.target.value }))} />
              </label>
            </div>
            <label className="field">
              <span>Summary</span>
              <input className="form-control" placeholder="Fetch order details" value={manualEndpoint.summary} onChange={(event) => setManualEndpoint((form) => ({ ...form, summary: event.target.value }))} />
            </label>
            <label className="field">
              <span>Operation ID</span>
              <input className="form-control" placeholder="getOrderDetails" value={manualEndpoint.operation_id} onChange={(event) => setManualEndpoint((form) => ({ ...form, operation_id: event.target.value }))} />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea className="form-control" placeholder="What MCP should know before calling this endpoint." value={manualEndpoint.description} onChange={(event) => setManualEndpoint((form) => ({ ...form, description: event.target.value }))} />
            </label>
            <div className="api-checkbox-row">
              <label><input type="checkbox" checked={manualEndpoint.auth_required} onChange={(event) => setManualEndpoint((form) => ({ ...form, auth_required: event.target.checked }))} /> Requires auth</label>
              <label><input type="checkbox" checked={manualEndpoint.is_accessible_to_ai} onChange={(event) => setManualEndpoint((form) => ({ ...form, is_accessible_to_ai: event.target.checked }))} /> AI can access</label>
            </div>
            {manualEndpoint.auth_required ? (
              <label className="field">
                <span>Auth type</span>
                <select className="form-control" value={manualEndpoint.auth_type} onChange={(event) => setManualEndpoint((form) => ({ ...form, auth_type: event.target.value }))}>
                  {authTypeOptions.filter((option) => option !== "None").map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ) : null}
            <EndpointFieldsEditor title="Parameters" fields={manualEndpoint.parameters} onChange={(parameters) => setManualEndpoint((form) => ({ ...form, parameters }))} includeLocation />
            <EndpointFieldsEditor title="Request body fields" fields={manualEndpoint.body_fields} onChange={(bodyFields) => setManualEndpoint((form) => ({ ...form, body_fields: bodyFields }))} />
            <EndpointResponsesEditor responses={manualEndpoint.responses} onChange={(responses) => setManualEndpoint((form) => ({ ...form, responses }))} />
            <button className="btn btn-dark btn-sm" onClick={addManualEndpoint} disabled={isSaving}>Add endpoint</button>
          </div>
        </div>
      </div>

      {serverConfig.sources.length > 0 ? (
        <div className="settings-section mt-6">
          <div className="api-source-head">
            <h4>Imported documentation</h4>
            <select className="form-control source-select" value={selectedSource?.id ?? ""} onChange={(event) => setSelectedSourceId(event.target.value)}>
              {serverConfig.sources.map((source) => <option key={source.id} value={source.id}>{source.title || source.source_url}</option>)}
            </select>
          </div>
          {selectedSource ? <OpenApiSourceViewer source={selectedSource} endpoints={serverConfig.endpoints.filter((endpoint) => endpoint.source_id === selectedSource.id)} /> : null}
        </div>
      ) : null}

      <div className="grid-3 mt-6">
        <MiniPanel title="Documentation sources" value={String(serverConfig.sources.length)} />
        <MiniPanel title="Endpoints found" value={isLoading ? "..." : String(serverConfig.endpoints.length)} />
        <MiniPanel title="AI accessible" value={`${aiEnabledCount}/${serverConfig.endpoints.length}`} />
      </div>

      <div className="api-header">
        <span className="api-base">{serverConfig.server.base_url || "No backend base URL saved yet"}</span>
        <span className="badge badge-amber">{authRequiredCount} auth-required endpoints</span>
      </div>
      <div className="api-body openapi-paths api-endpoint-table">
        {serverConfig.endpoints.length === 0 ? (
          <div className="api-empty">Import API documentation or add an endpoint manually.</div>
        ) : serverConfig.endpoints.map((endpoint) => {
          const isEditing = editingEndpointId === endpoint.id;
          const isExpanded = expandedEndpointId === endpoint.id;
          return (
          <div className="api-endpoint-item" key={endpoint.id}>
            <div className="openapi-path-row api-endpoint-row">
              <span className={`method-pill ${methodClass(endpoint.method)}`}>{endpoint.method}</span>
              <code>{endpoint.path}</code>
              <span>{endpoint.summary || endpoint.operation_id || endpoint.description || "No summary"}</span>
              <div className="api-perms">
                <span className={`perm-chip ${endpoint.is_accessible_to_ai ? "perm-ai" : "perm-off"}`}>{endpoint.is_accessible_to_ai ? "AI allowed" : "AI blocked"}</span>
                <span className={`perm-chip ${endpoint.auth_required ? "perm-auth" : "perm-ai"}`}>{endpoint.auth_required ? endpoint.auth_type || "Auth required" : "No auth"}</span>
              </div>
              <label className="toggle" title="Toggle AI access">
                <input type="checkbox" checked={endpoint.is_accessible_to_ai} onChange={() => toggleAiAccess(endpoint)} />
                <div className="toggle-track" />
              </label>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingEndpointId(null);
                  setExpandedEndpointId(isExpanded ? null : endpoint.id);
                }}
              >
                {isExpanded ? "Hide details" : "Details"}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => startEditingEndpoint(endpoint)}>Edit</button>
            </div>
            {isExpanded && !isEditing ? (
              <div className="api-detail-panel">
                <div className="api-detail-grid">
                  <ApiDetail label="Operation ID" value={endpoint.operation_id || "Not provided"} />
                  <ApiDetail label="Parameters" value={`${endpoint.parameters.length} defined`} />
                  <ApiDetail label="Request body" value={Object.keys(endpoint.request_body).length ? "Configured" : "None"} />
                  <ApiDetail label="Responses" value={Object.keys(endpoint.responses).join(", ") || "None"} />
                </div>
                {endpoint.description ? <p className="api-long-desc">{endpoint.description}</p> : null}
              </div>
            ) : null}
            {isEditing ? (
              <div className="api-detail-panel">
                <EndpointEditForm
                  endpoint={editEndpoint}
                  isSaving={isSaving}
                  onChange={setEditEndpoint}
                  onCancel={() => setEditingEndpointId(null)}
                  onSave={() => saveEndpointEdit(endpoint)}
                />
              </div>
            ) : null}
          </div>
        );})}
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

function Settings({
  initialSettings,
  onSettingsChange
}: {
  initialSettings: WorkspaceSettings;
  onSettingsChange: (settings: WorkspaceSettings) => void;
}) {
  const [settings, setSettingsState] = useState<WorkspaceSettings | null>(initialSettings);
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

  const companyId = settings?.company.id ?? initialSettings.company.id;

  useEffect(() => {
    setSettingsState(initialSettings);
    setCompany({
      name: initialSettings.company.name,
      industry: initialSettings.company.industry,
      team_size: initialSettings.company.team_size,
      description: initialSettings.company.description,
      primary_language: initialSettings.company.primary_language
    });
    setBrand(initialSettings.brand);
    setUserName({ first_name: initialSettings.user.first_name, last_name: initialSettings.user.last_name });
  }, [initialSettings]);

  function setSettings(update: (existing: WorkspaceSettings) => WorkspaceSettings) {
    setSettingsState((existing) => {
      if (!existing) return existing;
      const next = update(existing);
      onSettingsChange(next);
      return next;
    });
  }

  async function saveAccountSettings() {
    setIsSaving(true);
    setError(null);
    try {
      const user = await updateUserName(userName);
      setSettings((existing) => ({ ...existing, user }));
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
      const saved = await updateCompanySettings(company, companyId);
      setSettings((existing) => ({
        ...existing,
        company: saved,
        workspaces: existing.workspaces.map((workspace) => workspace.id === saved.id ? { ...workspace, name: saved.name } : workspace)
      }));
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
      const saved = await updateBrandSettings(brand, companyId);
      setSettings((existing) => ({ ...existing, brand: saved }));
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
      const member = await addMember(memberForm, companyId);
      setSettings((existing) => ({ ...existing, members: [...existing.members, member] }));
      setMemberForm({ email: "", first_name: "", last_name: "", role: "agent" });
      setNotice("Invitation email sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add member.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changeRole(member: CompanyMember, role: MemberRole) {
    try {
      const updated = await updateMemberRole(member.id, role, companyId);
      setSettings((existing) => ({
        ...existing,
        members: existing.members.map((item) => item.id === updated.id ? updated : item)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change role.");
    }
  }

  async function savePassword() {
    if (!passwordMeetsRequirements(passwordForm.new_password)) {
      setError("Password must be at least 8 characters and include lowercase, uppercase, number, and symbol.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

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
      {settings && !settings.user.email_verified ? (
        <div className="form-alert error mb-4">Verify your email before inviting agents or other workspace members.</div>
      ) : null}
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
            <PasswordField label="Current password" autoComplete="current-password" value={passwordForm.current_password} onChange={(value) => setPasswordForm((form) => ({ ...form, current_password: value }))} />
            <PasswordField label="New password" autoComplete="new-password" minLength={8} value={passwordForm.new_password} onChange={(value) => setPasswordForm((form) => ({ ...form, new_password: value }))} showRequirements />
            <PasswordField label="Confirm new password" autoComplete="new-password" minLength={8} value={passwordForm.confirm_password} onChange={(value) => setPasswordForm((form) => ({ ...form, confirm_password: value }))} />
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
            <button className="btn btn-primary btn-sm" onClick={inviteMember} disabled={isSaving || !settings?.user.email_verified}>Add member</button>
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

function ApiDetail({ label, value }: { label: string; value: string }) {
  return <div className="api-detail"><span>{label}</span><strong>{value}</strong></div>;
}

function OpenApiSourceViewer({ source, endpoints }: { source: ApiDocumentationSource; endpoints: ApiEndpoint[] }) {
  const info = source.raw_document.info as { title?: string; version?: string; description?: string } | undefined;
  const serverCount = Array.isArray(source.raw_document.servers) ? source.raw_document.servers.length : 0;

  return (
    <div className="openapi-viewer">
      <div className="openapi-meta">
        <div><span>Title</span><strong>{info?.title || source.title || "Imported API"}</strong></div>
        <div><span>Version</span><strong>{info?.version || source.version || "Not provided"}</strong></div>
        <div><span>Base URL</span><strong>{source.base_url || "Not provided"}</strong></div>
        <div><span>Format</span><strong>{source.source_type}</strong></div>
      </div>
      <div className="openapi-url">{source.source_url}</div>
      {info?.description ? <p className="api-long-desc">{info.description}</p> : null}
      <div className="openapi-summary">
        <MiniPanel title="Servers" value={String(serverCount)} />
        <MiniPanel title="Endpoints" value={String(endpoints.length)} />
        <MiniPanel title="Status" value={source.status} />
      </div>
    </div>
  );
}

function EndpointEditForm({
  endpoint,
  isSaving,
  onChange,
  onCancel,
  onSave
}: {
  endpoint: EndpointFormState;
  isSaving: boolean;
  onChange: (endpoint: EndpointFormState) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="endpoint-edit-form">
      <div className="field-row">
        <label className="field">
          <span>Method</span>
          <select className="form-control" value={endpoint.method} onChange={(event) => onChange({ ...endpoint, method: event.target.value })}>
            {["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].map((method) => <option key={method}>{method}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Path</span>
          <input className="form-control" value={endpoint.path} onChange={(event) => onChange({ ...endpoint, path: event.target.value })} />
        </label>
      </div>
      <label className="field">
        <span>Summary</span>
        <input className="form-control" value={endpoint.summary} onChange={(event) => onChange({ ...endpoint, summary: event.target.value })} />
      </label>
      <label className="field">
        <span>Operation ID</span>
        <input className="form-control" value={endpoint.operation_id} onChange={(event) => onChange({ ...endpoint, operation_id: event.target.value })} />
      </label>
      <label className="field">
        <span>Description</span>
        <textarea className="form-control" value={endpoint.description} onChange={(event) => onChange({ ...endpoint, description: event.target.value })} />
      </label>
      <div className="api-checkbox-row">
        <label><input type="checkbox" checked={endpoint.auth_required} onChange={(event) => onChange({ ...endpoint, auth_required: event.target.checked })} /> Requires auth</label>
        <label><input type="checkbox" checked={endpoint.is_accessible_to_ai} onChange={(event) => onChange({ ...endpoint, is_accessible_to_ai: event.target.checked })} /> AI can access</label>
      </div>
      {endpoint.auth_required ? (
        <label className="field">
          <span>Auth type</span>
          <select className="form-control" value={endpoint.auth_type} onChange={(event) => onChange({ ...endpoint, auth_type: event.target.value })}>
            {authTypeOptions.filter((option) => option !== "None").map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      ) : null}
      <EndpointFieldsEditor title="Parameters" fields={endpoint.parameters} onChange={(parameters) => onChange({ ...endpoint, parameters })} includeLocation />
      <EndpointFieldsEditor title="Request body fields" fields={endpoint.body_fields} onChange={(bodyFields) => onChange({ ...endpoint, body_fields: bodyFields })} />
      <EndpointResponsesEditor responses={endpoint.responses} onChange={(responses) => onChange({ ...endpoint, responses })} />
      <div className="endpoint-edit-actions">
        <button className="btn btn-primary btn-sm" onClick={onSave} disabled={isSaving}>Save endpoint</button>
        <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={isSaving}>Cancel</button>
      </div>
    </div>
  );
}

function EndpointFieldsEditor({
  title,
  fields,
  onChange,
  includeLocation = false
}: {
  title: string;
  fields: EndpointParameterForm[];
  onChange: (fields: EndpointParameterForm[]) => void;
  includeLocation?: boolean;
}) {
  function updateField(index: number, patch: Partial<EndpointParameterForm>) {
    onChange(fields.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field));
  }

  return (
    <div className="endpoint-field-editor">
      <div className="endpoint-field-head">
        <span>{title}</span>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => onChange([...fields, { name: "", location: includeLocation ? "query" : "body", type: "string", required: false, description: "" }])}>Add</button>
      </div>
      {fields.length === 0 ? <div className="field-hint">No {title.toLowerCase()} defined.</div> : fields.map((field, index) => (
        <div className="endpoint-field-row" key={`${title}-${index}`}>
          <input className="form-control" placeholder="name" value={field.name} onChange={(event) => updateField(index, { name: event.target.value })} />
          {includeLocation ? (
            <select className="form-control" value={field.location} onChange={(event) => updateField(index, { location: event.target.value })}>
              {["path", "query", "header", "cookie"].map((location) => <option key={location}>{location}</option>)}
            </select>
          ) : null}
          <select className="form-control" value={field.type} onChange={(event) => updateField(index, { type: event.target.value })}>
            {["string", "number", "integer", "boolean", "object", "array"].map((type) => <option key={type}>{type}</option>)}
          </select>
          <label className="field-check"><input type="checkbox" checked={field.required} onChange={(event) => updateField(index, { required: event.target.checked })} /> Required</label>
          <input className="form-control" placeholder="description" value={field.description} onChange={(event) => updateField(index, { description: event.target.value })} />
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => onChange(fields.filter((_, fieldIndex) => fieldIndex !== index))}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function EndpointResponsesEditor({ responses, onChange }: { responses: EndpointResponseForm[]; onChange: (responses: EndpointResponseForm[]) => void }) {
  function updateResponse(index: number, patch: Partial<EndpointResponseForm>) {
    onChange(responses.map((response, responseIndex) => responseIndex === index ? { ...response, ...patch } : response));
  }

  return (
    <div className="endpoint-field-editor">
      <div className="endpoint-field-head">
        <span>Responses</span>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => onChange([...responses, { status: "200", description: "" }])}>Add</button>
      </div>
      {responses.length === 0 ? <div className="field-hint">No responses defined.</div> : responses.map((response, index) => (
        <div className="endpoint-response-row" key={`response-${index}`}>
          <input className="form-control" placeholder="200" value={response.status} onChange={(event) => updateResponse(index, { status: event.target.value })} />
          <input className="form-control" placeholder="Successful response" value={response.description} onChange={(event) => updateResponse(index, { description: event.target.value })} />
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => onChange(responses.filter((_, responseIndex) => responseIndex !== index))}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function parametersPayload(fields: EndpointParameterForm[]) {
  return fields
    .filter((field) => field.name.trim())
    .map((field) => ({
      name: field.name.trim(),
      in: field.location,
      required: field.required,
      description: field.description.trim(),
      schema: { type: field.type }
    }));
}

function requestBodyPayload(fields: EndpointParameterForm[]) {
  const properties = Object.fromEntries(
    fields
      .filter((field) => field.name.trim())
      .map((field) => [field.name.trim(), { type: field.type, description: field.description.trim() }])
  );
  const required = fields.filter((field) => field.required && field.name.trim()).map((field) => field.name.trim());
  if (Object.keys(properties).length === 0) return {};
  return {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties,
          required
        }
      }
    }
  };
}

function responsesPayload(responses: EndpointResponseForm[]) {
  return Object.fromEntries(
    responses
      .filter((response) => response.status.trim())
      .map((response) => [response.status.trim(), { description: response.description.trim() || "Response" }])
  );
}

function endpointToForm(endpoint: ApiEndpoint): EndpointFormState {
  return {
    method: endpoint.method,
    path: endpoint.path,
    summary: endpoint.summary,
    description: endpoint.description,
    operation_id: endpoint.operation_id,
    auth_required: endpoint.auth_required,
    auth_type: endpoint.auth_type || "Bearer token",
    is_accessible_to_ai: endpoint.is_accessible_to_ai,
    parameters: endpoint.parameters.map(parameterToForm),
    body_fields: requestBodyToFields(endpoint.request_body),
    responses: Object.entries(endpoint.responses).map(([status, value]) => ({
      status,
      description: responseDescription(value)
    }))
  };
}

function parameterToForm(parameter: Record<string, unknown>): EndpointParameterForm {
  const schema = typeof parameter.schema === "object" && parameter.schema !== null ? parameter.schema as Record<string, unknown> : {};
  return {
    name: String(parameter.name ?? ""),
    location: String(parameter.in ?? "query"),
    type: String(schema.type ?? "string"),
    required: Boolean(parameter.required),
    description: String(parameter.description ?? "")
  };
}

function requestBodyToFields(requestBody: Record<string, unknown>): EndpointParameterForm[] {
  const content = typeof requestBody.content === "object" && requestBody.content !== null ? requestBody.content as Record<string, unknown> : {};
  const jsonContent = content["application/json"];
  const jsonObject = typeof jsonContent === "object" && jsonContent !== null ? jsonContent as Record<string, unknown> : {};
  const schema = typeof jsonObject.schema === "object" && jsonObject.schema !== null ? jsonObject.schema as Record<string, unknown> : {};
  const properties = typeof schema.properties === "object" && schema.properties !== null ? schema.properties as Record<string, unknown> : {};
  const required = Array.isArray(schema.required) ? schema.required.map(String) : [];
  return Object.entries(properties).map(([name, value]) => {
    const property = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
    return {
      name,
      location: "body",
      type: String(property.type ?? "string"),
      required: required.includes(name),
      description: String(property.description ?? "")
    };
  });
}

function responseDescription(value: unknown) {
  if (typeof value === "object" && value !== null && "description" in value) {
    return String((value as { description?: unknown }).description ?? "");
  }
  return "";
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
  if (method === "PUT" || method === "PATCH") return "m-put";
  return "m-delete";
}

function initials(firstName: string, lastName: string, email: string) {
  const value = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}` || email.slice(0, 2);
  return value.toUpperCase();
}

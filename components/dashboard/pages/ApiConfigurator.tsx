"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import type {
  ApiConfigurator as ApiConfiguratorState,
  ApiDocumentationSource,
  ApiEndpoint,
  ApiServerDetail
} from "@/lib/auth-api";
import {
  addApiEndpoint,
  createApiServer,
  getApiConfigurator,
  getApiServer,
  importApiDocumentation,
  updateApiEndpoint,
  updateApiServer
} from "@/lib/auth-api";
import { authTypeOptions, emptyEndpointForm } from "@/components/dashboard/constants";
import type {
  EndpointFormState,
  EndpointParameterForm,
  EndpointResponseForm
} from "@/components/dashboard/types";
import {
  endpointToForm,
  methodClass,
  parametersPayload,
  requestBodyPayload,
  responsesPayload
} from "@/components/dashboard/utils";
import { ApiDetail, MiniPanel, PageIntro } from "@/components/dashboard/shared";

export function ApiConfigurator({ companyId, serverId }: { companyId: string; serverId?: string }) {
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
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [showManualEndpointForm, setShowManualEndpointForm] = useState(false);
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
      const nextConfig = await importApiDocumentation(serverConfig.server.id, {
        source_url: sourceUrl.trim(),
        base_url: sourceBaseUrl.trim(),
        document_text: sourceDocumentText,
        document_name: sourceDocumentName
      }, companyId);
      applyServerConfig(nextConfig);
      setSourceUrl("");
      setSourceBaseUrl("");
      setSourceDocumentText("");
      setSourceDocumentName("");
      setSelectedSourceId(nextConfig.sources[0]?.id ?? null);
      setShowImportPanel(false);
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
      setShowManualEndpointForm(false);
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
  const methodSummary = serverConfig.endpoints.reduce<Record<string, number>>((summary, endpoint) => {
    summary[endpoint.method] = (summary[endpoint.method] ?? 0) + 1;
    return summary;
  }, {});

  return (
    <>
      <PageIntro title={serverConfig.server.name} body="Manage imported documentation, endpoints, auth behavior, and AI access." />
      {notice ? <div className="form-alert success mb-4">{notice}</div> : null}
      {error ? <div className="form-alert error mb-4">{error}</div> : null}

      <div className="api-server-actions mb-4">
        <Link className="btn btn-secondary btn-sm" href="/dashboard/api-configurator">All servers</Link>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowServerSettings((value) => !value)}>{showServerSettings ? "Hide settings" : "Edit server"}</button>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowImportPanel((value) => !value)}>{showImportPanel ? "Hide import" : "Import docs"}</button>
        <button className="btn btn-primary btn-sm" type="button" onClick={() => setShowManualEndpointForm((value) => !value)}>{showManualEndpointForm ? "Hide endpoint form" : "Add endpoint"}</button>
      </div>

      <div className="api-server-summary mb-4">
        <div><span>Base URL</span><strong>{serverConfig.server.base_url || "Not detected yet"}</strong></div>
        <div><span>Sources</span><strong>{serverConfig.sources.length}</strong></div>
        <div><span>Endpoints</span><strong>{serverConfig.endpoints.length}</strong></div>
        <div><span>AI access</span><strong>{aiEnabledCount}/{serverConfig.endpoints.length}</strong></div>
      </div>

      {showServerSettings ? (
        <div className="settings-section mb-4">
          <h4>Server configuration</h4>
          <div className="ob-form-stack">
            <div className="field-row">
              <label className="field"><span>Server name</span><input className="form-control" value={serverName} onChange={(event) => setServerName(event.target.value)} /></label>
              <label className="field"><span>Backend base URL</span><input className="form-control" type="url" value={backendBaseUrl} onChange={(event) => setBackendBaseUrl(event.target.value)} /></label>
            </div>
            <label className="field"><span>Server details</span><textarea className="form-control" value={serverDescription} onChange={(event) => setServerDescription(event.target.value)} /></label>
            <button className="btn btn-primary btn-sm" onClick={saveServerSettings} disabled={isSaving}>Save server configuration</button>
          </div>
        </div>
      ) : null}

      {showImportPanel ? (
        <div className="settings-section mb-4">
          <h4>Import documentation</h4>
          <div className="api-inline-form">
            <label className="field"><span>Swagger / OpenAPI URL</span><input className="form-control" type="url" placeholder="http://localhost:8010/openapi.json" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></label>
            <label className="field"><span>Override base URL</span><input className="form-control" type="url" placeholder="Optional. Auto-detected from servers[0].url when blank." value={sourceBaseUrl} onChange={(event) => setSourceBaseUrl(event.target.value)} /></label>
            <label className="field"><span>Upload API document</span><input className="form-control" type="file" accept=".json,.yaml,.yml,application/json,text/yaml,text/x-yaml" onChange={loadApiDocumentFile} /></label>
            <button className="btn btn-primary btn-sm" onClick={importDocumentation} disabled={isSaving}>Import</button>
          </div>
          {sourceDocumentName ? <div className="field-hint">Selected: {sourceDocumentName}</div> : null}
        </div>
      ) : null}

      {showManualEndpointForm ? (
        <div className="settings-section mb-4">
          <h4>Add endpoint manually</h4>
          <div className="ob-form-stack">
            <div className="field-row">
              <label className="field">
                <span>Method</span>
                <select className="form-control" value={manualEndpoint.method} onChange={(event) => setManualEndpoint((form) => ({ ...form, method: event.target.value }))}>
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => <option key={method}>{method}</option>)}
                </select>
              </label>
              <label className="field"><span>Path</span><input className="form-control" placeholder="/orders/{id}" value={manualEndpoint.path} onChange={(event) => setManualEndpoint((form) => ({ ...form, path: event.target.value }))} /></label>
            </div>
            <label className="field"><span>Summary</span><input className="form-control" placeholder="Fetch order details" value={manualEndpoint.summary} onChange={(event) => setManualEndpoint((form) => ({ ...form, summary: event.target.value }))} /></label>
            <label className="field"><span>Operation ID</span><input className="form-control" placeholder="getOrderDetails" value={manualEndpoint.operation_id} onChange={(event) => setManualEndpoint((form) => ({ ...form, operation_id: event.target.value }))} /></label>
            <label className="field"><span>Description</span><textarea className="form-control" placeholder="What MCP should know before calling this endpoint." value={manualEndpoint.description} onChange={(event) => setManualEndpoint((form) => ({ ...form, description: event.target.value }))} /></label>
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
      ) : null}

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

      <div className="api-header mt-6">
        <span className="api-base">Endpoints {Object.entries(methodSummary).map(([method, count]) => `${method} ${count}`).join(" / ") || "none"}</span>
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
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setEditingEndpointId(null);
                  setExpandedEndpointId(isExpanded ? null : endpoint.id);
                }}>
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
          );
        })}
      </div>
    </>
  );
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
        <label className="field"><span>Path</span><input className="form-control" value={endpoint.path} onChange={(event) => onChange({ ...endpoint, path: event.target.value })} /></label>
      </div>
      <label className="field"><span>Summary</span><input className="form-control" value={endpoint.summary} onChange={(event) => onChange({ ...endpoint, summary: event.target.value })} /></label>
      <label className="field"><span>Operation ID</span><input className="form-control" value={endpoint.operation_id} onChange={(event) => onChange({ ...endpoint, operation_id: event.target.value })} /></label>
      <label className="field"><span>Description</span><textarea className="form-control" value={endpoint.description} onChange={(event) => onChange({ ...endpoint, description: event.target.value })} /></label>
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

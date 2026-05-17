export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token?: string;
  user: AuthUser;
};

export type CompanySettings = {
  id: string;
  name: string;
  industry: string;
  team_size: string;
  description: string;
  primary_language: string;
};

export type BrandSettings = {
  workspace_name: string;
  assistant_name: string;
  widget_greeting: string;
  primary_color: string;
  accent_color: string;
  widget_background: string;
  logo_url: string;
};

export type MemberRole = "administrator" | "manager" | "agent" | "viewer";

export type CompanyMember = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: MemberRole;
  status: string;
  created_at: string;
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  role: MemberRole;
  status: string;
};

export type WorkspaceSettings = {
  user: AuthUser;
  company: CompanySettings;
  brand: BrandSettings;
  members: CompanyMember[];
  workspaces: WorkspaceSummary[];
  current_role: MemberRole;
};

export type JoinCode = {
  id: string;
  code: string;
  status: string;
  created_at: string;
};

export type JoinRequest = {
  id: string;
  company_id: string;
  company_name: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  requested_role: MemberRole;
  created_at: string;
};

export type WorkspaceState = {
  user: AuthUser;
  workspaces: WorkspaceSummary[];
  pending_join_requests: JoinRequest[];
};

export type ApiDocumentationSource = {
  id: string;
  server_id: string | null;
  source_type: string;
  source_url: string;
  title: string;
  version: string;
  base_url: string;
  status: string;
  raw_document: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ApiEndpoint = {
  id: string;
  server_id: string | null;
  source_id: string | null;
  method: string;
  path: string;
  summary: string;
  description: string;
  operation_id: string;
  auth_required: boolean;
  auth_type: string;
  parameters: Array<Record<string, unknown>>;
  request_body: Record<string, unknown>;
  responses: Record<string, unknown>;
  is_accessible_to_ai: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiServer = {
  id: string;
  name: string;
  description: string;
  base_url: string;
  source_count: number;
  endpoint_count: number;
  created_at: string;
  updated_at: string;
};

export type ApiConfigurator = {
  servers: ApiServer[];
};

export type ApiServerDetail = {
  server: ApiServer;
  sources: ApiDocumentationSource[];
  endpoints: ApiEndpoint[];
};

export type ApiServerCreatePayload = {
  name: string;
  base_url: string;
  description?: string;
  source_url?: string;
  document_text?: string;
  document_name?: string;
  source_type?: string;
};

export type ApiServerUpdatePayload = {
  name?: string;
  base_url?: string;
  description?: string;
};

export type ApiDocumentationImportPayload = {
  source_url: string;
  base_url?: string;
  document_text?: string;
  document_name?: string;
  source_type?: string;
};

export type ApiEndpointCreatePayload = {
  method: string;
  path: string;
  summary: string;
  description: string;
  operation_id?: string;
  auth_required: boolean;
  auth_type: string;
  parameters?: Array<Record<string, unknown>>;
  request_body?: Record<string, unknown>;
  responses?: Record<string, unknown>;
  is_accessible_to_ai: boolean;
};

export type ApiEndpointUpdatePayload = Partial<Pick<
  ApiEndpoint,
  | "method"
  | "path"
  | "summary"
  | "description"
  | "operation_id"
  | "auth_required"
  | "auth_type"
  | "parameters"
  | "request_body"
  | "responses"
  | "is_accessible_to_ai"
>>;

export type DocumentUpload = {
  id: string;
  company_id: string;
  category: "documents";
  original_filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  download_url: string;
  extraction_status: "queued" | "processing" | "completed" | "failed" | null;
  extracted_char_count: number | null;
  extraction_error: string | null;
};

export type DocumentExtraction = {
  id: string;
  upload_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  extracted_text: string;
  char_count: number;
  error_message: string;
  document_metadata: Record<string, unknown>;
  updated_at: string;
};

export type KnowledgeSource = {
  id: string;
  source_type: "web_page" | "upload" | string;
  source_url: string;
  source_title: string;
  status: "queued" | "processing" | "completed" | "failed";
  char_count: number;
  error_message: string;
  created_at: string;
  updated_at: string;
};

export type KnowledgeExtraction = KnowledgeSource & {
  extracted_text: string;
  document_metadata: Record<string, unknown>;
};

export type CrawlCategory = {
  id: string;
  label: string;
  description: string;
};

export type WebsiteCrawlCandidate = {
  id: string;
  url: string;
  title: string;
  depth: number;
  discovery_source: string;
  matched_categories: string[];
  match_reason: string;
  status: "candidate" | "selected" | "discarded" | "queued" | string;
  score: number;
  created_at: string;
  updated_at: string;
};

export type WebsiteCrawlJob = {
  id: string;
  root_url: string;
  normalized_root_url: string;
  status: "queued" | "processing" | "completed" | "failed" | string;
  selected_categories: string[];
  custom_prompt: string;
  max_depth: number;
  max_pages: number;
  total_discovered: number;
  total_matched: number;
  total_selected: number;
  error_message: string;
  recrawl_enabled: boolean;
  recrawl_interval_days: number | null;
  next_recrawl_at: string | null;
  last_recrawl_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteCrawlJobDetail = WebsiteCrawlJob & {
  candidates: WebsiteCrawlCandidate[];
};

export type RegisterPayload = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type MessageResponse = {
  message: string;
};

export type AcceptInvitationPayload = {
  token: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  new_password: string;
  confirm_password: string;
};

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:8010";
const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? "keycloak";
const KEYCLOAK_BASE_URL = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL ?? "";
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "";
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "";
const ACCESS_TOKEN_KEY = "brain_assistant_access_token";
const USER_KEY = "brain_assistant_user";
const KEYCLOAK_PKCE_KEY = "brain_assistant_keycloak_pkce";
const KEYCLOAK_STATE_KEY = "brain_assistant_keycloak_state";
const KEYCLOAK_NEXT_KEY = "brain_assistant_keycloak_next";

type KeycloakDiscovery = {
  authorization_endpoint: string;
  end_session_endpoint?: string;
};

type ApiErrorPayload = {
  detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>;
};

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function storeAuth(auth: AuthResponse) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, auth.access_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearStoredAuth() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isKeycloakAuthEnabled() {
  return AUTH_PROVIDER === "keycloak";
}

export async function register(payload: RegisterPayload) {
  if (isKeycloakAuthEnabled()) {
    await startKeycloakLogin("/onboarding");
    throw new AuthApiError("Redirecting to Keycloak.", 302);
  }
  return authRequest<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(payload: LoginPayload) {
  if (isKeycloakAuthEnabled()) {
    await startKeycloakLogin("/dashboard/overview");
    throw new AuthApiError("Redirecting to Keycloak.", 302);
  }
  return authRequest<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  return authRequest<MessageResponse>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return authRequest<MessageResponse>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function refreshSession() {
  if (isKeycloakAuthEnabled()) {
    return refreshKeycloakSession();
  }
  return authRequest<AuthResponse>("/api/v1/auth/refresh", {
    method: "POST"
  });
}

export async function verifyEmail(token: string) {
  return authRequest<AuthResponse>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token })
  });
}

export async function acceptInvitation(payload: AcceptInvitationPayload) {
  return authRequest<AuthResponse>("/api/v1/auth/accept-invitation", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getCurrentUser(accessToken: string) {
  return authRequest<AuthUser>("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export async function logout() {
  try {
    if (!isKeycloakAuthEnabled()) {
      await authRequest<{ message: string }>("/api/v1/auth/logout", {
        method: "POST"
      });
    }
  } finally {
    clearStoredAuth();
  }
}

export async function startKeycloakLogin(nextPath = "/dashboard/overview") {
  const discovery = await getKeycloakDiscovery();
  const codeVerifier = randomString(64);
  const codeChallenge = await pkceChallenge(codeVerifier);
  const state = randomString(32);
  const redirectUri = keycloakRedirectUri();

  window.sessionStorage.setItem(KEYCLOAK_PKCE_KEY, codeVerifier);
  window.sessionStorage.setItem(KEYCLOAK_STATE_KEY, state);
  window.sessionStorage.setItem(KEYCLOAK_NEXT_KEY, safeNextPath(nextPath));

  const params = new URLSearchParams({
    client_id: keycloakClientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256"
  });

  window.location.href = `${discovery.authorization_endpoint}?${params}`;
}

export async function completeKeycloakLogin(code: string, state: string | null) {
  const expectedState = window.sessionStorage.getItem(KEYCLOAK_STATE_KEY);
  const codeVerifier = window.sessionStorage.getItem(KEYCLOAK_PKCE_KEY);
  if (!state || state !== expectedState || !codeVerifier) {
    throw new AuthApiError("The Keycloak sign-in session expired. Please try again.", 400);
  }

  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: keycloakClientId(),
    code,
    redirect_uri: keycloakRedirectUri(),
    code_verifier: codeVerifier
  });
  const auth = await authRequest<AuthResponse>("/api/v1/auth/keycloak/exchange", {
    method: "POST",
    body: JSON.stringify({
      code: form.get("code"),
      code_verifier: form.get("code_verifier"),
      redirect_uri: form.get("redirect_uri")
    })
  });
  storeAuth(auth);
  const nextPath = window.sessionStorage.getItem(KEYCLOAK_NEXT_KEY) ?? "/dashboard/overview";
  window.sessionStorage.removeItem(KEYCLOAK_PKCE_KEY);
  window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
  window.sessionStorage.removeItem(KEYCLOAK_NEXT_KEY);
  return {
    auth,
    nextPath
  };
}

export async function startKeycloakLogout() {
  await fetch(`${AUTH_API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include"
  }).catch(() => undefined);
  clearStoredAuth();
  if (!isKeycloakAuthEnabled()) return;

  const discovery = await getKeycloakDiscovery();
  if (!discovery.end_session_endpoint) return;
  const params = new URLSearchParams({
    client_id: keycloakClientId(),
    post_logout_redirect_uri: `${window.location.origin}/`
  });
  window.location.href = `${discovery.end_session_endpoint}?${params}`;
}

export async function getWorkspaceState() {
  return authenticatedRequest<WorkspaceState>("/api/v1/settings/workspaces");
}

export async function getWorkspaceSettings(companyId?: string) {
  return authenticatedRequest<WorkspaceSettings>(withCompanyQuery("/api/v1/settings", companyId));
}

export async function createCompanySettings(payload: Omit<CompanySettings, "id">) {
  return authenticatedRequest<WorkspaceSettings>("/api/v1/settings/companies", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateUserName(payload: { first_name: string; last_name: string }) {
  const user = await authenticatedRequest<AuthUser>("/api/v1/settings/user", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function updateCompanySettings(payload: Omit<CompanySettings, "id">, companyId?: string) {
  return authenticatedRequest<CompanySettings>(withCompanyQuery("/api/v1/settings/company", companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function updateBrandSettings(payload: BrandSettings, companyId?: string) {
  return authenticatedRequest<BrandSettings>(withCompanyQuery("/api/v1/settings/brand", companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function addMember(payload: {
  email: string;
  first_name: string;
  last_name: string;
  role: MemberRole;
}, companyId?: string) {
  return authenticatedRequest<CompanyMember>(withCompanyQuery("/api/v1/settings/members", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function createJoinCode(companyId?: string) {
  return authenticatedRequest<JoinCode>(withCompanyQuery("/api/v1/settings/join-code", companyId), {
    method: "POST"
  });
}

export async function requestOrganizationJoin(code: string) {
  return authenticatedRequest<JoinRequest>("/api/v1/settings/join-requests", {
    method: "POST",
    body: JSON.stringify({ code })
  });
}

export async function listJoinRequests(companyId?: string) {
  return authenticatedRequest<JoinRequest[]>(withCompanyQuery("/api/v1/settings/join-requests", companyId));
}

export async function approveJoinRequest(joinRequestId: string, role: MemberRole, companyId?: string) {
  return authenticatedRequest<JoinRequest>(withCompanyQuery(`/api/v1/settings/join-requests/${joinRequestId}/approve`, companyId), {
    method: "POST",
    body: JSON.stringify({ role })
  });
}

export async function rejectJoinRequest(joinRequestId: string, companyId?: string) {
  return authenticatedRequest<JoinRequest>(withCompanyQuery(`/api/v1/settings/join-requests/${joinRequestId}/reject`, companyId), {
    method: "POST"
  });
}

export async function updateMemberRole(memberId: string, role: MemberRole, companyId?: string) {
  return authenticatedRequest<CompanyMember>(withCompanyQuery(`/api/v1/settings/members/${memberId}/role`, companyId), {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
}

export async function getApiConfigurator(companyId?: string) {
  return authenticatedRequest<ApiConfigurator>(withCompanyQuery("/api/v1/api-config", companyId));
}

export async function createApiServer(payload: ApiServerCreatePayload, companyId?: string) {
  return authenticatedRequest<ApiServerDetail>(withCompanyQuery("/api/v1/api-config/servers", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getApiServer(serverId: string, companyId?: string) {
  return authenticatedRequest<ApiServerDetail>(withCompanyQuery(`/api/v1/api-config/servers/${serverId}`, companyId));
}

export async function updateApiServer(serverId: string, payload: ApiServerUpdatePayload, companyId?: string) {
  return authenticatedRequest<ApiServerDetail>(withCompanyQuery(`/api/v1/api-config/servers/${serverId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function importApiDocumentation(serverId: string, payload: ApiDocumentationImportPayload, companyId?: string) {
  return authenticatedRequest<ApiServerDetail>(withCompanyQuery(`/api/v1/api-config/servers/${serverId}/import`, companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function addApiEndpoint(serverId: string, payload: ApiEndpointCreatePayload, companyId?: string) {
  return authenticatedRequest<ApiEndpoint>(withCompanyQuery(`/api/v1/api-config/servers/${serverId}/endpoints`, companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateApiEndpoint(serverId: string, endpointId: string, payload: ApiEndpointUpdatePayload, companyId?: string) {
  return authenticatedRequest<ApiEndpoint>(withCompanyQuery(`/api/v1/api-config/servers/${serverId}/endpoints/${endpointId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function listDocuments(companyId?: string) {
  return authenticatedRequest<DocumentUpload[]>(withCompanyQuery("/api/v1/uploads/documents", companyId));
}

export async function uploadDocument(file: File, companyId?: string) {
  const form = new FormData();
  form.append("file", file);
  return authenticatedRequest<DocumentUpload>(withCompanyQuery("/api/v1/uploads/documents", companyId), {
    method: "POST",
    body: form
  });
}

export async function deleteDocument(uploadId: string, companyId?: string) {
  return authenticatedRequest<MessageResponse>(withCompanyQuery(`/api/v1/uploads/documents/${uploadId}`, companyId), {
    method: "DELETE"
  });
}

export async function getDocumentExtraction(uploadId: string, companyId?: string) {
  return authenticatedRequest<DocumentExtraction>(withCompanyQuery(`/api/v1/uploads/documents/${uploadId}/extraction`, companyId));
}

export async function updateDocumentExtraction(uploadId: string, extractedText: string, companyId?: string) {
  return authenticatedRequest<DocumentExtraction>(withCompanyQuery(`/api/v1/uploads/documents/${uploadId}/extraction`, companyId), {
    method: "PATCH",
    body: JSON.stringify({ extracted_text: extractedText })
  });
}

export async function listWebPages(companyId?: string) {
  return authenticatedRequest<KnowledgeSource[]>(withCompanyQuery("/api/v1/knowledge/web-pages", companyId));
}

export async function createWebPageScrape(url: string, waitSeconds: number, companyId?: string) {
  return authenticatedRequest<KnowledgeSource>(withCompanyQuery("/api/v1/knowledge/web-pages", companyId), {
    method: "POST",
    body: JSON.stringify({ url, wait_seconds: waitSeconds })
  });
}

export async function deleteWebPage(knowledgeDocumentId: string, companyId?: string) {
  return authenticatedRequest<MessageResponse>(withCompanyQuery(`/api/v1/knowledge/web-pages/${knowledgeDocumentId}`, companyId), {
    method: "DELETE"
  });
}

export async function getKnowledgeExtraction(knowledgeDocumentId: string, companyId?: string) {
  return authenticatedRequest<KnowledgeExtraction>(withCompanyQuery(`/api/v1/knowledge/sources/${knowledgeDocumentId}/extraction`, companyId));
}

export async function updateKnowledgeExtraction(knowledgeDocumentId: string, extractedText: string, companyId?: string) {
  return authenticatedRequest<KnowledgeExtraction>(withCompanyQuery(`/api/v1/knowledge/sources/${knowledgeDocumentId}/extraction`, companyId), {
    method: "PATCH",
    body: JSON.stringify({ extracted_text: extractedText })
  });
}

export async function listCrawlCategories() {
  return authenticatedRequest<CrawlCategory[]>("/api/v1/knowledge/crawl-categories");
}

export async function createWebsiteCrawl(payload: {
  root_url: string;
  selected_categories: string[];
  custom_prompt: string;
  max_depth: number;
  max_pages: number;
}, companyId?: string) {
  return authenticatedRequest<WebsiteCrawlJobDetail>(withCompanyQuery("/api/v1/knowledge/crawls", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getWebsiteCrawl(crawlJobId: string, companyId?: string) {
  return authenticatedRequest<WebsiteCrawlJobDetail>(withCompanyQuery(`/api/v1/knowledge/crawls/${crawlJobId}`, companyId));
}

export async function queueWebsiteCrawlPages(crawlJobId: string, payload: {
  selected_candidate_ids: string[];
  manual_urls: string[];
  wait_seconds: number;
}, companyId?: string) {
  return authenticatedRequest<KnowledgeSource[]>(withCompanyQuery(`/api/v1/knowledge/crawls/${crawlJobId}/queue-pages`, companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateWebsiteCrawlSchedule(crawlJobId: string, payload: {
  recrawl_enabled: boolean;
  recrawl_interval_days: number | null;
}, companyId?: string) {
  return authenticatedRequest<WebsiteCrawlJob>(withCompanyQuery(`/api/v1/knowledge/crawls/${crawlJobId}/schedule`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function changePassword(payload: ChangePasswordPayload) {
  return authenticatedRequest<{ message: string }>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function authenticatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token = getStoredAccessToken();
  if (!token) {
    const refreshed = await refreshSession();
    storeAuth(refreshed);
    token = refreshed.access_token;
  }

  try {
    return await authRequest<T>(path, {
      ...init,
      headers: withAuthHeader(init.headers, token)
    });
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 401) throw error;
    const refreshed = await refreshSession();
    storeAuth(refreshed);
    return authRequest<T>(path, {
      ...init,
      headers: withAuthHeader(init.headers, refreshed.access_token)
    });
  }
}

function withAuthHeader(headersInit: HeadersInit | undefined, token: string) {
  const headers = new Headers(headersInit);
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function withCompanyQuery(path: string, companyId?: string) {
  if (!companyId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}company_id=${encodeURIComponent(companyId)}`;
}

async function authRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${AUTH_API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    throw new AuthApiError(await errorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

async function errorMessage(response: Response) {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    return "Something went wrong. Please try again.";
  }

  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(". ");
  }

  return "Something went wrong. Please try again.";
}

async function refreshKeycloakSession() {
  return authRequest<AuthResponse>("/api/v1/auth/refresh", {
    method: "POST"
  });
}

async function getKeycloakDiscovery() {
  const response = await fetch(`${keycloakIssuer()}/.well-known/openid-configuration`);
  if (!response.ok) {
    throw new AuthApiError("Could not load Keycloak configuration.", response.status);
  }
  return response.json() as Promise<KeycloakDiscovery>;
}

function keycloakIssuer() {
  if (!KEYCLOAK_BASE_URL || !KEYCLOAK_REALM) {
    throw new AuthApiError("Keycloak frontend environment variables are missing.", 500);
  }
  return `${KEYCLOAK_BASE_URL.replace(/\/$/, "")}/realms/${KEYCLOAK_REALM}`;
}

function keycloakClientId() {
  if (!KEYCLOAK_CLIENT_ID) {
    throw new AuthApiError("NEXT_PUBLIC_KEYCLOAK_CLIENT_ID is missing.", 500);
  }
  return KEYCLOAK_CLIENT_ID;
}

function keycloakRedirectUri() {
  return `${window.location.origin}/auth/keycloak/callback`;
}

function randomString(length: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function pkceChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeNextPath(nextPath: string) {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard/overview";
  }
  return nextPath;
}

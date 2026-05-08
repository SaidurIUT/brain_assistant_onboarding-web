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

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:8010";
const ACCESS_TOKEN_KEY = "brain_assistant_access_token";
const USER_KEY = "brain_assistant_user";

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

export async function register(payload: RegisterPayload) {
  return authRequest<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(payload: LoginPayload) {
  return authRequest<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function refreshSession() {
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
    await authRequest<{ message: string }>("/api/v1/auth/logout", {
      method: "POST"
    });
  } finally {
    clearStoredAuth();
  }
}

export async function getWorkspaceSettings(companyId?: string) {
  return authenticatedRequest<WorkspaceSettings>(withCompanyQuery("/api/v1/settings", companyId));
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

export async function updateMemberRole(memberId: string, role: MemberRole, companyId?: string) {
  return authenticatedRequest<CompanyMember>(withCompanyQuery(`/api/v1/settings/members/${memberId}/role`, companyId), {
    method: "PATCH",
    body: JSON.stringify({ role })
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
  if (init.body && !headers.has("Content-Type")) {
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

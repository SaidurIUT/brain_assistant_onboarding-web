"use client";

import { useEffect, useState } from "react";
import { PasswordField, passwordMeetsRequirements } from "@/components/PasswordField";
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
  isKeycloakAuthEnabled,
  updateBrandSettings,
  updateCompanySettings,
  updateMemberRole,
  updateUserName
} from "@/lib/auth-api";
import {
  brandStyle,
  ColorSetting,
  EditableField,
  EditableSelect,
  PageIntro
} from "@/components/dashboard/shared";

export function Settings({
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

        {!isKeycloakAuthEnabled() ? (
          <div className="settings-section">
            <h4>Change password</h4>
            <div className="ob-form-stack">
              <PasswordField label="Current password" autoComplete="current-password" value={passwordForm.current_password} onChange={(value) => setPasswordForm((form) => ({ ...form, current_password: value }))} />
              <PasswordField label="New password" autoComplete="new-password" minLength={8} value={passwordForm.new_password} onChange={(value) => setPasswordForm((form) => ({ ...form, new_password: value }))} showRequirements />
              <PasswordField label="Confirm new password" autoComplete="new-password" minLength={8} value={passwordForm.confirm_password} onChange={(value) => setPasswordForm((form) => ({ ...form, confirm_password: value }))} />
              <button className="btn btn-dark btn-sm" onClick={savePassword} disabled={isSaving}>Change password</button>
            </div>
          </div>
        ) : null}

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
          <div className="wl-preview" style={brandStyle(brand.primary_color)}><div className="wl-bar" /><div className="wl-head"><div className="wl-logo">{brand.assistant_name.slice(0, 1) || "B"}</div><span>{brand.assistant_name}</span></div><div className="wl-body"><div className="wl-msg user">How do I reset my password?</div><div className="wl-msg ai">{brand.widget_greeting}</div></div></div>
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

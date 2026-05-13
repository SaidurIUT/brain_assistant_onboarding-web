import type { EndpointFormState } from "@/components/dashboard/types";

export const emptyEndpointForm: EndpointFormState = {
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

export const authTypeOptions = ["Bearer token", "API key", "OAuth 2.0", "Basic auth", "Cookie/session", "Custom header", "None"];

export const navGroups = [
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

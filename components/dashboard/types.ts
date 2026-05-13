import type {
  DocumentUpload,
  KnowledgeSource
} from "@/lib/auth-api";

export type DashboardProps = {
  slug: DashboardSlug;
  apiServerId?: string;
};

export type DashboardSlug =
  | "overview"
  | "knowledge-base"
  | "data-sources"
  | "data-inconsistency"
  | "insights"
  | "api-configurator"
  | "api-log"
  | "system-prompt"
  | "chatwoot"
  | "settings"
  | "profiles";

export type EndpointFormState = {
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

export type EndpointParameterForm = {
  name: string;
  location: string;
  type: string;
  required: boolean;
  description: string;
};

export type EndpointResponseForm = {
  status: string;
  description: string;
};

export type KnowledgeSelection = {
  kind: "document" | "web_page";
  id: string;
  title: string;
  status: "queued" | "processing" | "completed" | "failed" | null;
  detail: string;
};

export type ExtractionStatus = DocumentUpload["extraction_status"] | KnowledgeSource["status"];

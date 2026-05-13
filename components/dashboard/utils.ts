import type { DocumentUpload, KnowledgeExtraction, KnowledgeSource } from "@/lib/auth-api";
import type {
  EndpointFormState,
  EndpointParameterForm,
  EndpointResponseForm,
  ExtractionStatus
} from "@/components/dashboard/types";
import type { ApiEndpoint } from "@/lib/auth-api";

export function methodClass(method: string) {
  if (method === "GET") return "m-get";
  if (method === "POST") return "m-post";
  if (method === "PUT" || method === "PATCH") return "m-put";
  return "m-delete";
}

export function documentIcon(filename: string) {
  const extension = filename.split(".").pop()?.toUpperCase();
  if (!extension) return "DOC";
  return extension.slice(0, 3);
}

export function isExtractionActive(status: ExtractionStatus) {
  return status === "queued" || status === "processing";
}

export function extractionStatusLabel(status: ExtractionStatus) {
  if (status === "queued") return "Queued";
  if (status === "processing") return "Processing";
  if (status === "completed") return "Ready";
  if (status === "failed") return "Failed";
  return "Pending";
}

export function extractionStatusClass(status: ExtractionStatus) {
  if (status === "completed") return "ready";
  if (status === "failed") return "failed";
  if (status === "processing") return "processing";
  return "queued";
}

export function extractionDetail(document: DocumentUpload) {
  if (document.extraction_status === "completed") {
    const count = document.extracted_char_count ?? 0;
    return `${count.toLocaleString()} extracted character${count === 1 ? "" : "s"}`;
  }
  if (document.extraction_status === "failed") {
    return document.extraction_error || "Extraction failed.";
  }
  if (document.extraction_status === "processing") return "Extracting selectable text...";
  if (document.extraction_status === "queued") return "Waiting for an extractor worker.";
  return "Extraction will start shortly.";
}

export function webPageDetail(page: KnowledgeSource | KnowledgeExtraction) {
  if (page.status === "completed") {
    const count = page.char_count ?? 0;
    return `${count.toLocaleString()} scraped character${count === 1 ? "" : "s"}`;
  }
  if (page.status === "failed") {
    return page.error_message || "Web scrape failed.";
  }
  if (page.status === "processing") return "Rendering page and extracting visible text...";
  if (page.status === "queued") return "Waiting for a scraper worker.";
  return "Scrape will start shortly.";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function initials(firstName: string, lastName: string, email: string) {
  const value = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}` || email.slice(0, 2);
  return value.toUpperCase();
}

export function parametersPayload(fields: EndpointParameterForm[]) {
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

export function requestBodyPayload(fields: EndpointParameterForm[]) {
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

export function responsesPayload(responses: EndpointResponseForm[]) {
  return Object.fromEntries(
    responses
      .filter((response) => response.status.trim())
      .map((response) => [response.status.trim(), { description: response.description.trim() || "Response" }])
  );
}

export function endpointToForm(endpoint: ApiEndpoint): EndpointFormState {
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

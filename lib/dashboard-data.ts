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

export const dashboardSlugs: DashboardSlug[] = [
  "overview",
  "knowledge-base",
  "data-sources",
  "data-inconsistency",
  "insights",
  "api-configurator",
  "api-log",
  "system-prompt",
  "chatwoot",
  "settings",
  "profiles"
];

export const dashboardTitles: Record<DashboardSlug, string> = {
  overview: "Overview",
  "knowledge-base": "Knowledge Base",
  "data-sources": "Data Sources",
  "data-inconsistency": "Data Inconsistency",
  insights: "Conversation Insights",
  "api-configurator": "API Configurator",
  "api-log": "API Call Log",
  "system-prompt": "System Prompt Configuration",
  chatwoot: "Chatwoot",
  settings: "Settings & Brand",
  profiles: "Customer Profiles"
};

export const stats = [
  ["Conversations this week", "847", "up 12% vs last week", "brand"],
  ["AI resolution rate", "91.3%", "up 3.2% vs last week", "green"],
  ["Knowledge entries", "4,213", "up 64 new this week", "accent"],
  ["Human handoffs", "23", "down 5 vs last week", "amber"]
];

export const topics = [
  ["Pricing & Plans", "312 entries", 75, "#6366f1"],
  ["API Integration", "248 entries", 60, "#06b6d4"],
  ["Authentication", "195 entries", 47, "#10b981"],
  ["Billing & Invoices", "167 entries", 40, "#f59e0b"],
  ["Technical Errors", "143 entries", 35, "#ef4444"]
];

export const apiEndpoints = [
  ["GET", "/orders/{id}", "Fetch order status and delivery details", "AI allowed", "Auth required"],
  ["POST", "/tickets", "Create an escalation ticket", "AI allowed", "Needs confirm"],
  ["PUT", "/users/{id}", "Update customer profile fields", "Review", "Auth required"],
  ["GET", "/subscriptions/{id}", "Read plan and billing status", "AI allowed", "Read only"],
  ["POST", "/refunds", "Create refund request", "Human only", "Sensitive"],
  ["DELETE", "/sessions/{id}", "Revoke user session", "Disabled", "Sensitive"]
];

export const apiLogs = [
  ["2m ago", "GET", "/orders/ord_8821", "Success", "Sarah K.", "142ms"],
  ["12m ago", "POST", "/tickets", "Success", "Alex R.", "331ms"],
  ["31m ago", "GET", "/subscriptions/sub_219", "Success", "James T.", "118ms"],
  ["1h ago", "POST", "/refunds", "Blocked", "Priya M.", "0ms"]
];

export const sourceRows = [
  ["Website Crawler", "acme.com full crawl", "847 pages", "Synced 3h ago", "Active"],
  ["Swagger / OpenAPI", "api.acme.com/swagger.json", "45 endpoints", "Synced 1d ago", "Active"],
  ["Google Drive", "Support Documents", "12 files", "Synced 5h ago", "Synced"],
  ["Direct Uploads", "Manual PDFs and docs", "5 files", "Uploaded 2d ago", "Active"]
];

export const profiles = [
  ["Sarah K.", "sarah@techcorp.io", "14 conversations", "API, Auth", "87"],
  ["James T.", "james@ventureapp.com", "8 conversations", "Billing, Pricing", "72"],
  ["Priya M.", "priya@scalestartup.in", "22 conversations", "API, SAML", "94"],
  ["Alex R.", "alex@devtools.io", "6 conversations", "Webhooks, API", "65"]
];

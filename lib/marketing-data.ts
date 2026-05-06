export const integrations = [
  { label: "OneDrive", code: "OD", color: "#0078d4" },
  { label: "Google Drive", code: "GD", color: "#34a853" },
  { label: "Chatwoot", code: "CW", color: "#1f93ff" },
  { label: "Swagger / OpenAPI", code: "SW", color: "#6366f1" },
  { label: "PDF & Docs", code: "PDF", color: "#ef4444" },
  { label: "Website scraper", code: "WS", color: "#10b981" }
];

export const features = [
  {
    icon: "BA",
    tone: "fi-brand",
    title: "Knowledge Graph RAG",
    body: "Build a multi-source knowledge graph from your website, Swagger docs, PDFs, and Drive files. AI answers ground themselves in your actual content."
  },
  {
    icon: "API",
    tone: "fi-accent",
    title: "API Action Engine",
    body: "Connect your REST APIs and let AI act on behalf of users, including looking up orders, creating tickets, and processing refunds with permissions you control."
  },
  {
    icon: "CW",
    tone: "fi-green",
    title: "Chatwoot Native Integration",
    body: "Runs alongside Chatwoot's omnichannel inbox. Whitelabel the UI with your brand colours, logo, and assistant name. Agents see AI context inline."
  },
  {
    icon: "DS",
    tone: "fi-amber",
    title: "Multi-Source Ingestion",
    body: "Sync from OneDrive, Google Drive, Notion, Confluence, or direct uploads. Every useful document lands in the knowledge graph automatically."
  },
  {
    icon: "HO",
    tone: "fi-brand",
    title: "Intelligent Human Handoff",
    body: "When confidence drops or a customer escalates, the AI hands the conversation to a human agent with full context and source references attached."
  },
  {
    icon: "CI",
    tone: "fi-accent",
    title: "Conversation Intelligence",
    body: "Batch-process transcript archives to discover knowledge gaps, auto-generate FAQ entries, build customer profiles, and surface trending topics."
  }
];

export const workflowSteps = [
  ["Brand & connect", "Add your logo, colours, and connect or provision a Chatwoot instance. Whitelabeling happens automatically."],
  ["Ingest knowledge", "Scrape your website, import Swagger docs, connect cloud drives, and upload documents."],
  ["Configure AI actions", "Expose REST API endpoints, define what AI can do, and set permission boundaries per action."],
  ["Embed & go live", "Paste one JS snippet on your website. The branded chat widget activates immediately."],
  ["AI keeps learning", "Transcripts feed insights, gaps become FAQs, and customer profiles sharpen over time."]
];

export const knowledgeSources = [
  ["Website Scraper", "Crawl public pages, docs sites, and help centres automatically during onboarding.", "WS", "#f0f9ff"],
  ["Swagger / OpenAPI", "Import your API spec so AI understands endpoint semantics and technical questions.", "API", "#eff6ff"],
  ["Google Drive & OneDrive", "OAuth-connect cloud storage. Files sync automatically when updated.", "GD", "#f0fdf4"],
  ["Direct Uploads", "FAQs, manuals, pricing sheets, policy docs, onboarding guides: PDF, DOCX, or MD.", "DOC", "#fef9c3"]
];

export const plans = [
  {
    name: "Starter",
    price: "$49",
    suffix: "/mo",
    description: "For small teams adding AI to one support channel.",
    featured: false,
    cta: "Get started",
    features: ["1 Chatwoot workspace", "Website scraping", "Basic knowledge graph", "500 AI conversations/mo", "1-snippet embed"]
  },
  {
    name: "Growth",
    price: "$149",
    suffix: "/mo",
    description: "For SaaS teams with API actions, cloud drives, and full whitelabeling.",
    featured: true,
    cta: "Start free trial",
    features: ["5 team seats", "API Action Engine", "Google Drive & OneDrive", "Swagger ingestion", "Full Chatwoot whitelabeling", "5,000 AI conversations/mo", "Conversation intelligence"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    description: "For companies with multiple products, custom data pipelines, and compliance needs.",
    featured: false,
    cta: "Talk to sales",
    features: ["Unlimited workspaces", "Custom knowledge pipelines", "On-premise Chatwoot", "Advanced RBAC", "Dedicated onboarding", "SLA & priority support"]
  }
];

export const onboardingSteps = [
  { title: "Account", subtitle: "Admin login" },
  { title: "Company", subtitle: "Business basics" },
  { title: "Brand", subtitle: "Logo & colours" },
  { title: "Website", subtitle: "Scraping config" },
  { title: "API Docs", subtitle: "Swagger & actions" },
  { title: "Data Sources", subtitle: "Drive & uploads" },
  { title: "Chatwoot", subtitle: "Connect inbox" },
  { title: "Review", subtitle: "Launch workspace" }
];

export const cloudSources = [
  { id: "gdrive", title: "Google Drive", description: "Click to connect via OAuth", connected: "12 files synced", icon: "GD", bg: "#f0fdf4" },
  { id: "onedrive", title: "Microsoft OneDrive", description: "Click to connect via OAuth", connected: "8 files synced", icon: "OD", bg: "#eff6ff" },
  { id: "notion", title: "Notion", description: "Click to connect via OAuth", connected: "5 pages linked", icon: "NO", bg: "#f8f9fa" },
  { id: "confluence", title: "Confluence", description: "Click to connect", connected: "3 spaces linked", icon: "CF", bg: "#eff6ff" }
];

export const reviewRows = {
  company: [
    ["Company name", "Acme Corp"],
    ["Industry", "SaaS / Software"],
    ["Team size", "6-20 agents"]
  ],
  sources: [
    ["Website crawl", "Full crawl: acme.com"],
    ["Swagger / OpenAPI", "api.acme.com/swagger.json"],
    ["Google Drive", "Connected: 12 files"],
    ["Uploaded docs", "3 files: FAQ, Pricing, Policy"],
    ["API endpoints exposed", "3 of 6 selected"]
  ],
  chatwoot: [
    ["Instance", "chatwoot.acme.com"],
    ["Whitelabeling", "Enabled"],
    ["Inbox", "Website Support"]
  ]
};

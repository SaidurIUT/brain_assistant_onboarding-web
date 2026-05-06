import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Brain Assistant 23 | AI Support Automation on Chatwoot",
    template: "%s | Brain Assistant 23"
  },
  description: "AI onboarding, Chatwoot integration, knowledge ingestion, and support automation for Brain Assistant.",
  applicationName: "Brain Assistant 23",
  metadataBase: new URL("https://brainassistant23.example.com")
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

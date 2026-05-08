# Onboarding Web

Next.js app for the Brain Assistant onboarding website and dashboard demo.

## Local URL

- Onboarding web: http://localhost:3010

## Commands

```bash
npm install
npm run dev
npm run build
```

`npm run dev` and `npm run start` use port `3010` by default so Chatwoot can keep port `3000`.

The app uses dummy operational data for the marketing site and dashboard panels. Authentication, organization switching, profile, company, brand, and member invite data come from the FastAPI backend.

Email verification and invitations open these routes from backend emails:

- `/verify-email?token=...`
- `/invite/accept?token=...`

## Brain Assistant Chat Widget

The app embeds the local Chatwoot website widget as the Brain Assistant chat bot.

Current local widget values:

```text
Base URL: http://localhost:3000
Website token: 78fDe8kJgCyRacypBgL3fQB1
```

Verification flow:

1. Run Chatwoot from the workspace runbook so http://localhost:3000 is available.
2. Confirm http://localhost:3000/packs/js/sdk.js returns `200 OK`. If it returns `404`, run `docker compose exec vite npm run build:sdk` from `../chatwoot`.
3. Run this app with `npm run dev`.
4. Open http://localhost:3010.
5. Use the bottom-right Chatwoot launcher to send a message as a visitor.
6. Check the Chatwoot admin inbox for the new conversation.

If a new website inbox is created in Chatwoot, update `CHATWOOT_WEBSITE_TOKEN` in `components/ChatwootWidget.tsx`.

# Haller Dev-Dashboard

Interne Rohversion: zeigt den aktuellen Supabase-Zustand der AQuT-Pipeline (Leads, Objekte, Mandant) und triggert Demo-Mails über n8n. Kein Kundenprodukt, kein Design-Anspruch, kein Login.

## Setup

```bash
cp .env.example .env.local
# SUPABASE_SERVICE_ROLE_KEY + N8N_WEBHOOK_BASE_URL eintragen
npm install
npm run dev
```

Env-Vars (auch auf Vercel setzen):

| Variable | Hinweis |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Geheim.** Niemals `NEXT_PUBLIC_` |
| `N8N_WEBHOOK_BASE_URL` | z. B. `https://n8n.ritz-ai.solutions` (ohne Slash am Ende). Server-only. |

Der Service-Role-Key umgeht RLS. Das ist für diese Rohversion beabsichtigt. Empfänger-Override für Mails (`DEMO_MAIL_OVERRIDE=marco@ritz-ai.solutions`) liegt in **n8n**, nicht hier.

## Seiten

- `/leads` — Anfragen-Liste; Detail mit Requirements, HITL und Demo-Mail-Buttons
- `/objekte` — Objekte + Requirements (read-only)
- `/kunden` — Mandant `haller`
- `/demo-mails` — vier WF5-Vorlagen ohne Lead-Kontext

### Demo-Mails

Buttons rufen `POST {N8N_WEBHOOK_BASE_URL}/webhook/demo-mail` auf. WF5-Import: AQuT `n8n-workflows/clients/haller/5_mail-versand.json`.

HITL Freigeben/Ablehnen aktualisiert nur Supabase; der DB-Trigger postet an `/webhook/hitl-resolved` (derselbe WF5-Workflow).

## Deploy / Sicherheit

Neues Vercel-Projekt aus diesem Ordner. **Deployment Protection (Passwort)** aktivieren.

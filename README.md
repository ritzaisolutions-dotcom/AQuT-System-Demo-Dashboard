# Haller Dev-Dashboard

Interne Rohversion: zeigt den aktuellen Supabase-Zustand der AQuT-Pipeline (Leads, Objekte, Mandant). Kein Kundenprodukt, kein Design-Anspruch, kein Login.

## Setup

```bash
cp .env.example .env.local
# SUPABASE_SERVICE_ROLE_KEY aus Supabase → Project Settings → API eintragen
npm install
npm run dev
```

Env-Vars (auch auf Vercel setzen):

| Variable | Hinweis |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Geheim.** Niemals `NEXT_PUBLIC_` — sonst landet der Key im Browser-Bundle. |

Der Service-Role-Key umgeht RLS. Das ist für diese Rohversion beabsichtigt (ein Mandant, leeres `dashboard_users`). Die spätere Vollversion nutzt Anon-Key + Auth + RLS.

## Seiten

- `/leads` — Anfragen-Liste; Detail mit Requirements + HITL Freigeben/Ablehnen
- `/objekte` — Objekte + zugeordnete Requirements (read-only)
- `/kunden` — Mandant `haller`

HITL-Updates setzen nur `qualification_status` (und bei Ablehnung `abgelehnt_grund` / `abgelehnt_am`). Der bestehende Trigger `leads_hitl_resolved_webhook` benachrichtigt n8n.

`abgelehnt_von` bleibt `null`: die Spalte ist `uuid` FK auf `auth.users`, und dieses Dashboard hat keine Auth.

## Deploy / Sicherheit

Neues Vercel-Projekt aus diesem Ordner. Nach dem Deploy **Deployment Protection (Passwort)** in den Vercel-Projekteinstellungen aktivieren — die URL enthält sonst ungeschützt echte Interessenten-Daten.

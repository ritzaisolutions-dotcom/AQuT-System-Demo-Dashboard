# Haller Dev-Dashboard — Build-Spezifikation für Cursor

## Zweck

Interne Rohversion, kein Kundenprodukt, kein Design-Anspruch. Zeigt den aktuellen Datenbank-Zustand direkt an, damit der Fortschritt der AQuT-Pipeline sichtbar wird, ohne SQL zu schreiben. Ersetzt NICHT die spätere, vollständige Frontend-Spezifikation (siehe Notion "Frontend Requirements fürs CRM") — das hier ist bewusst der kleinstmögliche Ausschnitt davon.

## Tech-Stack

- **Next.js** (App Router), TypeScript
- **Supabase JS Client**, ausschließlich server-seitig (Server Components / Route Handlers)
- **Deploy:** Vercel, kein eigenes Backend nötig
- **Styling:** Tailwind reicht, kein Design-System, keine Komponentenbibliothek nötig für diese Version

## Datenbankzugriff — wichtige Design-Entscheidung

Diese Rohversion nutzt den **Service-Role-Key**, nicht den Anon-Key, und umgeht damit bewusst Row Level Security. Begründet, weil:

- Aktuell existiert nur ein Mandant (`haller`) — keine Mandantentrennung zu verletzen
- `dashboard_users` (die Tabelle, an der RLS hängt) ist leer, RLS würde also ohnehin nichts durchlassen
- Es soll niemand außer dir auf die URL zugreifen (siehe Sicherheitshinweis unten)

**Für die spätere Vollversion gilt das NICHT** — dort zwingend Anon-Key + RLS + echte Auth, wie in der Frontend-Spezifikation beschrieben.

## Seiten / Tabs

### 1. `/leads` — Anfragen

Tabelle, Spalten: Status, Vorname/Nachname, E-Mail, Objekt (Bezeichnung, per Join), Art (Kauf/Miete), Eingangsdatum (`created_at`).

Klick auf eine Zeile → Detailansicht:
- Alle Lead-Felder
- Requirement-Status-Liste (Join `lead_requirement_status` + `requirements_catalog`): Label, Status (vorhanden/fehlt/unklar), Pflicht ja/nein
- **Falls `qualification_status = 'hitl_review'`:** zwei Buttons
  - **"Freigeben"** → schreibt `qualification_status = 'qualifiziert'` (oder `'rueckfrage'`, falls noch Pflichtfelder fehlen — einfachste Variante: immer `'qualifiziert'`, Feinschliff später)
  - **"Ablehnen"** → verlangt zwingend ein Freitext-Feld für den Grund, schreibt `qualification_status = 'unqualifiziert'`, `abgelehnt_grund`, `abgelehnt_am = now()`, `abgelehnt_von` (Platzhalter-Wert reicht, z. B. `'dev-dashboard'`, echte Nutzer-Zuordnung kommt erst mit echter Auth)

Diese zwei Updates lösen automatisch die bereits gebaute Datenbank-Trigger-Kette aus (siehe Migration `008_hitl_resume_webhook`) — im Dashboard selbst ist dafür nichts weiter zu tun als das Update abzusetzen.

### 2. `/objekte` — Objekte

Liste: Bezeichnung, Adresse, Art, Zimmer, m², aktiv/inaktiv.

Pro Objekt (Detail oder aufklappbar): die zugeordneten Requirements aus `objekt_requirements`, mit `aktiv` und `pflicht` als Anzeige (read-only reicht für diese Version, kein Editieren nötig).

### 3. `/kunden` — Mandant

Zeigt die eine Zeile aus `clients` (aktuell nur `haller`): Name, `kauf_termin_dauer_minuten`, `lead_retention_tage`, `llm_calls_limit`. Wird sparsam aussehen, das ist bei nur einem Mandanten korrekt und erwartet.

## Relevante Tabellen (alle bereits live in Supabase)

`leads`, `lead_requirement_status`, `requirements_catalog`, `objekte`, `objekt_requirements`, `clients`

## Env Vars auf Vercel

Zwei Werte, kein OAuth, kein weiterer Provider:

```
SUPABASE_URL=https://htyeflqymmbcjhvknjoe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<aus Supabase Dashboard → Project Settings → API>
```

`SUPABASE_URL` ist nicht geheim (steht ohnehin im Client-Code jeder Supabase-App), wird aber trotzdem als Env-Var geführt statt hartcodiert. `SUPABASE_SERVICE_ROLE_KEY` ist der einzige tatsächlich sensible Wert — **niemals mit `NEXT_PUBLIC_`-Präfix versehen**, sonst landet er im Browser-Bundle und ist für jeden einsehbar.

## Ausdrücklich NICHT im Umfang dieser Version

- Kein Login/Auth
- Keine Smart Search
- Keine KPI-Übersicht, keine Diagramme
- Kein Design-Anspruch, keine Marken-Farben
- Kein Editieren von Objekten/Requirements (nur Anzeige)
- Keine E-Mail-Vorschau/-Versand (das leistet bereits das n8n-Demoformular)

## Sicherheitshinweis — bitte nicht überspringen

Ohne jeden Zugriffsschutz ist die Vercel-URL, sobald bekannt, für jeden mit dem Link offen einsehbar — inklusive echter Namen, E-Mail-Adressen, Telefonnummern von Interessenten. Für eine reine Rohversion vertretbar, **wenn** die URL wirklich niemand außer dir kennt. Kein Ersatz für echten Zugriffsschutz, sobald mehr als du selbst draufschaut.

**Minimal-Empfehlung, kaum Mehraufwand:** Vercel Deployment Protection (Passwort-Schutz) in den Projekteinstellungen aktivieren — kein Code nötig, ein Klick in der Vercel-Oberfläche.

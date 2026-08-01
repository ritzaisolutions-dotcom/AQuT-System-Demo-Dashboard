"use server";

export type DemoMailTemplate =
  | "miete_qualifiziert"
  | "miete_rueckfrage"
  | "kauf_qualifiziert"
  | "absage";

export type DemoMailResult =
  | { ok: true; detail: string }
  | { ok: false; error: string };

export async function sendDemoMail(
  template: DemoMailTemplate,
  leadId?: string | null,
): Promise<DemoMailResult> {
  const base = (process.env.N8N_WEBHOOK_BASE_URL || "").replace(/\/$/, "");
  if (!base) {
    return {
      ok: false,
      error:
        "N8N_WEBHOOK_BASE_URL fehlt in .env.local (z. B. https://n8n.ritz-ai.solutions)",
    };
  }

  const url = `${base}/webhook/demo-mail`;
  const body: { template: DemoMailTemplate; lead_id?: string } = { template };
  if (leadId) body.lead_id = leadId;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      const msg =
        typeof parsed === "object" &&
        parsed &&
        "error" in parsed &&
        typeof (parsed as { error: unknown }).error === "string"
          ? (parsed as { error: string }).error
          : `HTTP ${res.status}: ${text.slice(0, 200)}`;
      return { ok: false, error: msg };
    }

    const detail =
      typeof parsed === "object" && parsed
        ? JSON.stringify(parsed)
        : text || "ok";
    return { ok: true, detail };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Webhook-Aufruf fehlgeschlagen",
    };
  }
}

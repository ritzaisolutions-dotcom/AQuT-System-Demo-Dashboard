"use client";

import { useState, useTransition } from "react";
import {
  sendDemoMail,
  type DemoMailTemplate,
} from "@/lib/demo-mail";

const BUTTONS: { template: DemoMailTemplate; label: string }[] = [
  { template: "miete_qualifiziert", label: "Miete · Qualifiziert" },
  { template: "miete_rueckfrage", label: "Miete · Rückfrage" },
  { template: "kauf_qualifiziert", label: "Kauf · Beratung" },
  { template: "absage", label: "Absage" },
];

export function DemoMailButtons({ leadId }: { leadId?: string | null }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(template: DemoMailTemplate) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await sendDemoMail(template, leadId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(`Gesendet (${template}). Empfänger: DEMO_MAIL_OVERRIDE in n8n.`);
    });
  }

  return (
    <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Demo-Mails</h2>
        <p className="text-xs text-slate-600">
          Triggert WF5 über <code>/webhook/demo-mail</code>. Geht an{" "}
          <code>marco@ritz-ai.solutions</code>, solange{" "}
          <code>DEMO_MAIL_OVERRIDE</code> in n8n gesetzt ist.
          {leadId ? " Nutzt Daten dieses Leads." : " Ohne Lead: feste Demo-Daten."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map((btn) => (
          <button
            key={btn.template}
            type="button"
            disabled={pending}
            onClick={() => run(btn.template)}
            className="rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-100 disabled:opacity-50"
          >
            {btn.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </section>
  );
}

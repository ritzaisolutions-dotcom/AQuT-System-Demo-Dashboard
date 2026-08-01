"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ablehnenLead, freigebenLead } from "./actions";

export function HitlForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [grund, setGrund] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runFreigeben() {
    setError(null);
    startTransition(async () => {
      const result = await freigebenLead(leadId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function runAblehnen() {
    setError(null);
    startTransition(async () => {
      const result = await ablehnenLead(leadId, grund);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="space-y-3 rounded border border-amber-300 bg-amber-50 p-4">
      <h2 className="text-sm font-semibold text-slate-900">
        HITL-Review — Freigeben / Ablehnen
      </h2>
      <p className="text-xs text-slate-600">
        Update löst den DB-Trigger <code>leads_hitl_resolved_webhook</code> aus.
        Ablehnung: <code>abgelehnt_von</code> bleibt leer (kein Auth-User).
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={runFreigeben}
          className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Freigeben
        </button>
      </div>

      <div className="space-y-2 border-t border-amber-200 pt-3">
        <label className="block text-xs font-medium text-slate-700" htmlFor="grund">
          Ablehnungsgrund (Pflicht)
        </label>
        <textarea
          id="grund"
          value={grund}
          onChange={(e) => setGrund(e.target.value)}
          rows={3}
          className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
          placeholder="Grund für Ablehnung…"
        />
        <button
          type="button"
          disabled={pending}
          onClick={runAblehnen}
          className="rounded bg-red-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Ablehnen
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}

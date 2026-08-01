import { formatValue } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function KundenPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, name, kauf_termin_dauer_minuten, lead_retention_tage, llm_calls_limit, created_at",
    )
    .eq("id", "haller")
    .maybeSingle();

  if (error) {
    return (
      <p className="text-sm text-red-700">
        Fehler beim Laden: {error.message}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-700">Kein Mandant gefunden.</p>;
  }

  const client = data as Client;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Kunde / Mandant</h1>
      <p className="text-sm text-slate-600">
        Aktuell nur ein Mandant — die Ansicht bleibt bewusst schlicht.
      </p>
      <dl className="max-w-md space-y-3 rounded border border-slate-200 bg-white p-4 text-sm">
        <div>
          <dt className="text-xs text-slate-500">name</dt>
          <dd className="font-medium text-slate-900">{client.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">id</dt>
          <dd className="font-mono text-[13px]">{client.id}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">kauf_termin_dauer_minuten</dt>
          <dd>{formatValue(client.kauf_termin_dauer_minuten)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">lead_retention_tage</dt>
          <dd>{formatValue(client.lead_retention_tage)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">llm_calls_limit</dt>
          <dd>{formatValue(client.llm_calls_limit)}</dd>
        </div>
      </dl>
    </div>
  );
}

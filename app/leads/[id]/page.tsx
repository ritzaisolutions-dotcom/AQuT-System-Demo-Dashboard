import Link from "next/link";
import { displayName, formatDateTime, formatValue } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type {
  Lead,
  LeadRequirementStatus,
  RequirementsCatalog,
} from "@/lib/types";
import { HitlForm } from "./hitl-form";
import { DemoMailButtons } from "@/app/demo-mails/demo-mail-buttons";

export const dynamic = "force-dynamic";

type RequirementRow = LeadRequirementStatus & {
  requirements_catalog: Pick<RequirementsCatalog, "id" | "key" | "label"> | null;
  pflicht: boolean | null;
};

const LEAD_FIELD_ORDER: (keyof Lead)[] = [
  "id",
  "client_id",
  "convo_id",
  "vorname",
  "nachname",
  "anschrift",
  "email",
  "telefon",
  "intent",
  "objekt_id",
  "qualification_status",
  "confidence_score",
  "hitl_grund",
  "abgelehnt_von",
  "abgelehnt_am",
  "abgelehnt_grund",
  "automated_replies_sent_count",
  "last_outbound_message_id",
  "last_inbound_message_id",
  "booking_link_sent_count",
  "booking_link_last_sent_at",
  "auto_delete",
  "llm_calls_count",
  "created_at",
  "updated_at",
];

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (leadError) {
    return (
      <p className="text-sm text-red-700">
        Fehler beim Laden: {leadError.message}
      </p>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-700">Lead nicht gefunden.</p>
        <Link href="/leads" className="text-sm text-blue-700 hover:underline">
          ← Zurück zur Liste
        </Link>
      </div>
    );
  }

  const typedLead = lead as Lead;

  const { data: reqRows, error: reqError } = await supabase
    .from("lead_requirement_status")
    .select(
      "id, lead_id, requirement_id, status, confidence, geprueft_am, requirements_catalog(id, key, label)",
    )
    .eq("lead_id", id);

  type RawReqRow = Omit<RequirementRow, "requirements_catalog" | "pflicht"> & {
    requirements_catalog:
      | Pick<RequirementsCatalog, "id" | "key" | "label">
      | Pick<RequirementsCatalog, "id" | "key" | "label">[]
      | null;
  };

  let requirements: RequirementRow[] = [];
  if (!reqError && reqRows) {
    const raw = reqRows as unknown as RawReqRow[];
    requirements = raw.map((row) => {
      const catalog = Array.isArray(row.requirements_catalog)
        ? (row.requirements_catalog[0] ?? null)
        : row.requirements_catalog;
      return { ...row, requirements_catalog: catalog, pflicht: null };
    });

    if (typedLead.objekt_id && typedLead.client_id) {
      const { data: objektReqs } = await supabase
        .from("objekt_requirements")
        .select("requirement_id, pflicht")
        .eq("client_id", typedLead.client_id)
        .eq("objekt_id", typedLead.objekt_id);

      const pflichtByReq = new Map(
        (objektReqs ?? []).map((r) => [
          r.requirement_id as string,
          r.pflicht as boolean,
        ]),
      );

      requirements = requirements.map((row) => ({
        ...row,
        pflicht: pflichtByReq.get(row.requirement_id) ?? null,
      }));
    }
  }

  let objektLabel: string | null = null;
  if (typedLead.objekt_id) {
    const { data: objekt } = await supabase
      .from("objekte")
      .select("bezeichnung")
      .eq("client_id", typedLead.client_id)
      .eq("id", typedLead.objekt_id)
      .maybeSingle();
    objektLabel = objekt?.bezeichnung ?? typedLead.objekt_id;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <Link href="/leads" className="text-xs text-slate-500 hover:underline">
            ← Leads
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">
            {displayName(typedLead.vorname, typedLead.nachname)}
          </h1>
          <p className="text-sm text-slate-600">
            Status: <strong>{typedLead.qualification_status}</strong>
            {objektLabel ? (
              <>
                {" "}
                · Objekt:{" "}
                <Link
                  href={`/objekte/${typedLead.objekt_id}`}
                  className="hover:underline"
                >
                  {objektLabel}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>

      {typedLead.qualification_status === "hitl_review" ? (
        <HitlForm leadId={typedLead.id} />
      ) : null}

      <DemoMailButtons leadId={typedLead.id} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">Lead-Felder</h2>
        <dl className="grid gap-x-6 gap-y-2 rounded border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
          {LEAD_FIELD_ORDER.map((key) => {
            let value: unknown = typedLead[key];
            if (key === "created_at" || key === "updated_at" || key === "abgelehnt_am" || key === "booking_link_last_sent_at") {
              value = formatDateTime(value as string | null);
            } else {
              value = formatValue(value);
            }
            return (
              <div key={key} className="min-w-0">
                <dt className="text-xs text-slate-500">{key}</dt>
                <dd className="break-all font-mono text-[13px] text-slate-900">
                  {String(value)}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Requirement-Status
        </h2>
        {reqError ? (
          <p className="text-sm text-red-700">{reqError.message}</p>
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Label</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Pflicht</th>
                  <th className="px-3 py-2 font-medium">Confidence</th>
                  <th className="px-3 py-2 font-medium">Geprüft</th>
                </tr>
              </thead>
              <tbody>
                {requirements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-slate-500">
                      Keine Requirement-Einträge.
                    </td>
                  </tr>
                ) : (
                  requirements.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-2">
                        {row.requirements_catalog?.label ?? row.requirement_id}
                      </td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">
                        {row.pflicht === null
                          ? "—"
                          : row.pflicht
                            ? "ja"
                            : "nein"}
                      </td>
                      <td className="px-3 py-2">
                        {row.confidence ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {formatDateTime(row.geprueft_am)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

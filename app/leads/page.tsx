import Link from "next/link";
import { displayName, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { LeadListRow } from "@/lib/types";

export const dynamic = "force-dynamic";

type RawLeadRow = Omit<LeadListRow, "objekte"> & {
  objekte:
    | { bezeichnung: string | null }
    | { bezeichnung: string | null }[]
    | null;
};

function normalizeObjekt(
  objekte: RawLeadRow["objekte"],
): LeadListRow["objekte"] {
  if (!objekte) return null;
  return Array.isArray(objekte) ? (objekte[0] ?? null) : objekte;
}

export default async function LeadsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, qualification_status, vorname, nachname, email, intent, created_at, objekt_id, objekte(bezeichnung)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-red-700">
        Fehler beim Laden der Leads: {error.message}
      </p>
    );
  }

  const leads: LeadListRow[] = ((data ?? []) as unknown as RawLeadRow[]).map(
    (row) => ({
      ...row,
      objekte: normalizeObjekt(row.objekte),
    }),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Leads / Anfragen</h1>
      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">E-Mail</th>
              <th className="px-3 py-2 font-medium">Objekt</th>
              <th className="px-3 py-2 font-medium">Art</th>
              <th className="px-3 py-2 font-medium">Eingang</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-slate-500">
                  Keine Leads vorhanden.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-slate-900 underline-offset-2 hover:underline"
                    >
                      {lead.qualification_status}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/leads/${lead.id}`} className="hover:underline">
                      {displayName(lead.vorname, lead.nachname)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{lead.email}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {lead.objekte?.bezeichnung || lead.objekt_id || "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {lead.intent ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDateTime(lead.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

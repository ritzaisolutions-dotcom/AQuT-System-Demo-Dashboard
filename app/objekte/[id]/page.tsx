import Link from "next/link";
import { formatAddress, formatValue } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Objekt, RequirementsCatalog } from "@/lib/types";

export const dynamic = "force-dynamic";

type ObjektRequirementRow = {
  aktiv: boolean;
  pflicht: boolean;
  requirement_id: string;
  requirements_catalog: Pick<
    RequirementsCatalog,
    "id" | "key" | "label" | "gilt_fuer"
  > | null;
};

export default async function ObjektDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();

  const { data: objekt, error } = await supabase
    .from("objekte")
    .select("*")
    .eq("id", id)
    .eq("client_id", "haller")
    .maybeSingle();

  if (error) {
    return (
      <p className="text-sm text-red-700">
        Fehler beim Laden: {error.message}
      </p>
    );
  }

  if (!objekt) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-700">Objekt nicht gefunden.</p>
        <Link href="/objekte" className="text-sm text-blue-700 hover:underline">
          ← Zurück zur Liste
        </Link>
      </div>
    );
  }

  const typed = objekt as Objekt;

  const { data: reqRows, error: reqError } = await supabase
    .from("objekt_requirements")
    .select(
      "aktiv, pflicht, requirement_id, requirements_catalog(id, key, label, gilt_fuer)",
    )
    .eq("client_id", typed.client_id)
    .eq("objekt_id", typed.id);

  type RawObjektReq = Omit<ObjektRequirementRow, "requirements_catalog"> & {
    requirements_catalog:
      | ObjektRequirementRow["requirements_catalog"]
      | NonNullable<ObjektRequirementRow["requirements_catalog"]>[]
      | null;
  };

  const requirements: ObjektRequirementRow[] = (
    (reqRows ?? []) as unknown as RawObjektReq[]
  ).map((row) => ({
    ...row,
    requirements_catalog: Array.isArray(row.requirements_catalog)
      ? (row.requirements_catalog[0] ?? null)
      : row.requirements_catalog,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/objekte" className="text-xs text-slate-500 hover:underline">
          ← Objekte
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">
          {typed.bezeichnung || typed.id}
        </h1>
        <p className="text-sm text-slate-600">
          {typed.typ} · {typed.aktiv ? "aktiv" : "inaktiv"} ·{" "}
          {formatAddress(typed.strasse, typed.plz, typed.ort)}
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">Objekt-Felder</h2>
        <dl className="grid gap-x-6 gap-y-2 rounded border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
          {(
            [
              "id",
              "client_id",
              "typ",
              "bezeichnung",
              "strasse",
              "plz",
              "ort",
              "zimmer",
              "qm",
              "max_personen",
              "zustaendiges_postfach",
              "ziel_kalender",
              "is24_id",
              "aktiv",
            ] as const
          ).map((key) => (
            <div key={key}>
              <dt className="text-xs text-slate-500">{key}</dt>
              <dd className="break-all font-mono text-[13px]">
                {formatValue(typed[key])}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Requirements (read-only)
        </h2>
        {reqError ? (
          <p className="text-sm text-red-700">{reqError.message}</p>
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Label</th>
                  <th className="px-3 py-2 font-medium">Key</th>
                  <th className="px-3 py-2 font-medium">Aktiv</th>
                  <th className="px-3 py-2 font-medium">Pflicht</th>
                  <th className="px-3 py-2 font-medium">Gilt für</th>
                </tr>
              </thead>
              <tbody>
                {requirements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-slate-500">
                      Keine Requirements zugeordnet.
                    </td>
                  </tr>
                ) : (
                  requirements.map((row) => (
                    <tr
                      key={row.requirement_id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-2">
                        {row.requirements_catalog?.label ?? row.requirement_id}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {row.requirements_catalog?.key ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {row.aktiv ? "ja" : "nein"}
                      </td>
                      <td className="px-3 py-2">
                        {row.pflicht ? "ja" : "nein"}
                      </td>
                      <td className="px-3 py-2">
                        {row.requirements_catalog?.gilt_fuer ?? "—"}
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

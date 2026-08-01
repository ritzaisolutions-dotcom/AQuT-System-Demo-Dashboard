import Link from "next/link";
import { formatAddress } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Objekt } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ObjektePage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("objekte")
    .select(
      "id, client_id, typ, bezeichnung, strasse, plz, ort, zimmer, qm, aktiv",
    )
    .order("bezeichnung", { ascending: true });

  if (error) {
    return (
      <p className="text-sm text-red-700">
        Fehler beim Laden der Objekte: {error.message}
      </p>
    );
  }

  const objekte = (data ?? []) as Objekt[];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Objekte</h1>
      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Bezeichnung</th>
              <th className="px-3 py-2 font-medium">Adresse</th>
              <th className="px-3 py-2 font-medium">Art</th>
              <th className="px-3 py-2 font-medium">Zimmer</th>
              <th className="px-3 py-2 font-medium">m²</th>
              <th className="px-3 py-2 font-medium">Aktiv</th>
            </tr>
          </thead>
          <tbody>
            {objekte.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-slate-500">
                  Keine Objekte vorhanden.
                </td>
              </tr>
            ) : (
              objekte.map((objekt) => (
                <tr
                  key={`${objekt.client_id}:${objekt.id}`}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/objekte/${objekt.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {objekt.bezeichnung || objekt.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatAddress(objekt.strasse, objekt.plz, objekt.ort)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{objekt.typ}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {objekt.zimmer ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {objekt.qm ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {objekt.aktiv ? "aktiv" : "inaktiv"}
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

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type HitlActionResult = { ok: true } | { ok: false; error: string };

export async function freigebenLead(leadId: string): Promise<HitlActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ qualification_status: "qualifiziert" })
    .eq("id", leadId)
    .eq("qualification_status", "hitl_review");

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { ok: true };
}

export async function ablehnenLead(
  leadId: string,
  grund: string,
): Promise<HitlActionResult> {
  const trimmed = grund.trim();
  if (!trimmed) {
    return { ok: false, error: "Ablehnungsgrund ist Pflicht." };
  }

  const supabase = createClient();
  // abgelehnt_von stays null: column is uuid FK → auth.users; no Auth in this
  // raw dashboard. Audit trail still has grund + timestamp.
  const { error } = await supabase
    .from("leads")
    .update({
      qualification_status: "unqualifiziert",
      abgelehnt_grund: trimmed,
      abgelehnt_am: new Date().toISOString(),
      abgelehnt_von: null,
    })
    .eq("id", leadId)
    .eq("qualification_status", "hitl_review");

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { ok: true };
}

export type QualificationStatus =
  | "neu"
  | "qualifiziert"
  | "rueckfrage"
  | "unqualifiziert"
  | "hitl_review";

export type Intent = "miete" | "kauf";

export type HitlGrund =
  | "niedrige_konfidenz"
  | "belegung_auffaellig"
  | "loop_schutz";

export type RequirementStatusValue = "vorhanden" | "unklar" | "fehlt";

export type Lead = {
  id: string;
  client_id: string;
  convo_id: string;
  vorname: string | null;
  nachname: string | null;
  anschrift: string | null;
  email: string;
  telefon: string | null;
  intent: Intent | null;
  objekt_id: string | null;
  qualification_status: QualificationStatus;
  confidence_score: number | null;
  hitl_grund: HitlGrund | null;
  abgelehnt_von: string | null;
  abgelehnt_am: string | null;
  abgelehnt_grund: string | null;
  automated_replies_sent_count: number;
  last_outbound_message_id: string | null;
  last_inbound_message_id: string | null;
  booking_link_sent_count: number;
  booking_link_last_sent_at: string | null;
  auto_delete: boolean;
  llm_calls_count: number;
  created_at: string;
  updated_at: string;
};

export type Objekt = {
  id: string;
  client_id: string;
  typ: Intent;
  bezeichnung: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  zimmer: number | null;
  qm: number | null;
  max_personen: number | null;
  zustaendiges_postfach: string | null;
  ziel_kalender: string | null;
  is24_id: string | null;
  aktiv: boolean;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  kauf_termin_dauer_minuten: number;
  lead_retention_tage: number;
  llm_calls_limit: number;
  created_at: string;
};

export type RequirementsCatalog = {
  id: string;
  key: string;
  label: string;
  gilt_fuer: "miete" | "kauf" | "beide";
  beschreibung: string | null;
  created_at: string;
};

export type ObjektRequirement = {
  client_id: string;
  objekt_id: string;
  requirement_id: string;
  aktiv: boolean;
  pflicht: boolean;
  created_at: string;
};

export type LeadRequirementStatus = {
  id: string;
  lead_id: string;
  requirement_id: string;
  status: RequirementStatusValue;
  confidence: number | null;
  geprueft_am: string;
};

export type LeadListRow = Pick<
  Lead,
  | "id"
  | "qualification_status"
  | "vorname"
  | "nachname"
  | "email"
  | "intent"
  | "created_at"
  | "objekt_id"
> & {
  objekte: { bezeichnung: string | null } | null;
};

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAddress(
  strasse: string | null,
  plz: string | null,
  ort: string | null,
): string {
  const street = strasse?.trim() || "";
  const city = [plz, ort].filter(Boolean).join(" ").trim();
  if (street && city) return `${street}, ${city}`;
  return street || city || "—";
}

export function displayName(
  vorname: string | null,
  nachname: string | null,
): string {
  const name = [vorname, nachname].filter(Boolean).join(" ").trim();
  return name || "—";
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "ja" : "nein";
  return String(value);
}

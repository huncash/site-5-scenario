export function splitAddress(address: string, zip?: string, city?: string): { irsz: string; telepules: string; cim: string } {
  const irsz = (zip ?? "").trim();
  const telepules = (city ?? "").trim();
  if (irsz && telepules) return { irsz, telepules, cim: address.trim() || telepules };
  const m = address.match(/^(\d{4})\s+([^,]+),?\s*(.*)$/);
  if (m) return { irsz: irsz || m[1], telepules: telepules || m[2].trim(), cim: m[3].trim() || m[2].trim() };
  return { irsz: irsz || "0000", telepules: telepules || "—", cim: address };
}

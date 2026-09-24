import { useMemo } from "react";

import { LeanTerm } from "@/components/HelpIcon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessAsset, BusinessLocation, Transaction } from "@/lib/finance";
import { formatMoney } from "@/lib/finance";
import type { RealEstateProperty, VehicleResource } from "@/types/workspace";
import { cn } from "@/lib/utils";

function fold(input: string) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function nodeRow({
  title,
  subtitle,
  badges,
  kpis,
}: {
  title: string;
  subtitle?: string | null;
  badges?: Array<{ label: string; className: string; title?: string }>;
  kpis?: Array<{ label: string; value: string; className?: string; title?: string }>;
}) {
  return (
    <div className="relative rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-slate-100">{title}</div>
          {subtitle ? <div className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</div> : null}
          {badges && badges.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", b.className)}
                  title={b.title}
                  data-exact={b.title}
                >
                  {b.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {kpis && kpis.length > 0 ? (
          <div className="text-right text-[11px]">
            {kpis.map((k) => (
              <div
                key={k.label}
                className={cn("font-mono tabular-nums", k.className)}
                title={k.title}
                data-exact={k.title}
              >
                <span className="text-muted-foreground">{k.label}: </span>
                <span className="text-slate-100">{k.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AssetTree({
  properties,
  assets,
  locations,
  vehicles,
  txns,
  currency = "HUF",
  businessLabel = "Vállalkozás",
}: {
  properties: RealEstateProperty[];
  assets: BusinessAsset[];
  locations: BusinessLocation[];
  vehicles: VehicleResource[];
  txns: Transaction[];
  currency?: string;
  businessLabel?: string;
}) {
  const propertyStats = useMemo(() => {
    const byId = new Map<string, { income: number; expense: number; count: number }>();
    for (const p of properties) byId.set(p.id, { income: 0, expense: 0, count: 0 });
    for (const t of txns) {
      const pid = (t.property_id ?? null) as string | null;
      if (!pid || !byId.has(pid)) continue;
      const a = Math.max(0, Number(t.amount ?? 0));
      const s = byId.get(pid)!;
      s.count += 1;
      if (t.type === "income") s.income += a;
      else if (t.type === "expense") s.expense += a;
    }
    return byId;
  }, [properties, txns]);

  const assetStats = useMemo(() => {
    const byId = new Map<string, { expense: number; capex: number; maint: number; opex: number; count: number }>();
    for (const a of assets) byId.set(a.id, { expense: 0, capex: 0, maint: 0, opex: 0, count: 0 });
    for (const t of txns) {
      const aid = (t.asset_id ?? null) as string | null;
      if (!aid || !byId.has(aid)) continue;
      const a = Math.max(0, Number(t.amount ?? 0));
      const s = byId.get(aid)!;
      s.count += 1;
      if (t.type !== "expense") continue;
      s.expense += a;
      const k = t.cost_kind ?? "opex";
      if (k === "capex") s.capex += a;
      else if (k === "maintenance") s.maint += a;
      else s.opex += a;
    }
    return byId;
  }, [assets, txns]);

  const vehicleStats = useMemo(() => {
    const out = new Map<string, { expense: number; count: number }>();
    const plates = (vehicles ?? [])
      .map((v) => String(v.plateNumber ?? "").trim().toUpperCase())
      .filter(Boolean);
    for (const v of vehicles) out.set(v.id, { expense: 0, count: 0 });
    if (plates.length === 0) return out;

    for (const t of txns) {
      if (t.type !== "expense") continue;
      const hay = `${t.title ?? ""} ${t.note ?? ""} ${t.party ?? ""} ${t.category ?? ""}`.toUpperCase();
      for (const v of vehicles) {
        const p = String(v.plateNumber ?? "").trim().toUpperCase();
        if (!p) continue;
        if (!hay.includes(p)) continue;
        const s = out.get(v.id)!;
        s.count += 1;
        s.expense += Math.max(0, Number(t.amount ?? 0));
        break;
      }
    }
    return out;
  }, [txns, vehicles]);

  const ingatlanok = properties ?? [];
  const ingosagok = assets ?? [];
  const szekhelyLocs = locations.filter((l) => l.kind === "szekhely");

  const hasBusinessSide = locations.length > 0 || assets.length > 0 || vehicles.length > 0;

  return (
    <Card className="w-full border border-border/60 bg-background/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <LeanTerm
            title="Vagyon — fa/halmaz nézet"
            exact="Vagyonfa — magán és cég eszközei egy fában. A kötés mutatja, melyik tétel melyik eszközhöz tartozik."
          >
            Vagyon — fa/halmaz nézet
          </LeanTerm>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          {nodeRow({
            title: "👤 Magánszemély",
            subtitle: "Központi csomópont — ingatlanok/ingóságok + kapcsolt költségek",
            badges: [
              {
                label: "magán",
                className: "border-slate-500/30 bg-slate-500/10 text-slate-200",
                title: "Magán oldal — a saját keret, nem a céges kassza.",
              },
            ],
          })}
          {hasBusinessSide
            ? nodeRow({
                title: `🏢 ${businessLabel}`,
                subtitle: "Telephely / eszközök / flotta kötések",
                badges: [
                  {
                    label: "cég",
                    className: "border-sky-500/30 bg-sky-500/10 text-sky-200",
                    title: "Céges oldal — telephely, eszköz, flotta a vállalkozáshoz kötve.",
                  },
                ],
              })
            : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <LeanTerm
                className="text-xs font-semibold uppercase tracking-wider text-slate-200"
                title="Ingatlanok"
                exact="Ingatlanok — lakás, kiadott, telephely. A költség a hozzá kötött tételekből jön."
              >
                🏠 Ingatlanok
              </LeanTerm>
              <Badge variant="secondary" className="text-[10px]">
                {ingatlanok.length}
              </Badge>
            </div>

            {ingatlanok.length === 0 ? (
              <div className="text-xs text-muted-foreground">Nincs rögzített ingatlan.</div>
            ) : (
              <div className="relative space-y-2 pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-border/60" />
                {ingatlanok.map((p) => {
                  const s = propertyStats.get(p.id) ?? { income: 0, expense: 0, count: 0 };
                  const net = s.income - s.expense;
                  const links = [
                    { label: "magán", className: "border-slate-500/30 bg-slate-500/10 text-slate-200" },
                    ...(szekhelyLocs.length > 0
                      ? [{ label: "cég: székhely", className: "border-sky-500/30 bg-sky-500/10 text-sky-200" }]
                      : []),
                  ];
                  return (
                    <div key={p.id} className="relative">
                      <div className="absolute -left-[18px] top-3 h-2.5 w-2.5 rounded-full border border-border bg-slate-950" />
                      {nodeRow({
                        title: p.name,
                        subtitle: p.address,
                        badges: links,
                        kpis: [
                          {
                            label: "érték",
                            value: formatMoney(Math.round(Number(p.estimatedValue ?? 0)), currency),
                          },
                          {
                            label: "költség",
                            value: formatMoney(Math.round(s.expense), currency),
                          },
                          {
                            label: "nettó",
                            value: `${net >= 0 ? "+" : ""}${formatMoney(Math.round(net), currency)}`,
                            className: net >= 0 ? "text-emerald-200" : "text-rose-200",
                          },
                        ],
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-background/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <LeanTerm
                className="text-xs font-semibold uppercase tracking-wider text-slate-200"
                title="Ingóságok"
                exact="gép, autó, eszköz. capex: beszerzés, opex: üzem, karb: javítás. Magán→cég: saját cucc céges használatban."
              >
                🚗 Ingóságok
              </LeanTerm>
              <Badge variant="secondary" className="text-[10px]">
                {ingosagok.length + (vehicles?.length ?? 0)}
              </Badge>
            </div>

            {ingosagok.length === 0 && (vehicles?.length ?? 0) === 0 ? (
              <div className="text-xs text-muted-foreground">Nincs rögzített ingóság/eszköz.</div>
            ) : (
              <div className="relative space-y-2 pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-border/60" />

                {(vehicles ?? []).map((v) => {
                  const s = vehicleStats.get(v.id) ?? { expense: 0, count: 0 };
                  const badge =
                    v.type === "company_fleet"
                      ? { label: "cég: flotta", className: "border-sky-500/30 bg-sky-500/10 text-sky-200" }
                      : { label: "magán→cég", className: "border-amber-500/30 bg-amber-500/10 text-amber-200" };
                  return (
                    <div key={v.id} className="relative">
                      <div className="absolute -left-[18px] top-3 h-2.5 w-2.5 rounded-full border border-border bg-slate-950" />
                      {nodeRow({
                        title: `${v.name} (${v.plateNumber})`,
                        subtitle: v.type === "company_fleet" ? "Flotta jármű" : "Magánautó üzleti használat",
                        badges: [badge],
                        kpis: [
                          { label: "ktg", value: formatMoney(Math.round(s.expense), currency) },
                          { label: "db", value: String(s.count) },
                        ],
                      })}
                    </div>
                  );
                })}

                {ingosagok.map((a) => {
                  const s = assetStats.get(a.id) ?? { expense: 0, capex: 0, maint: 0, opex: 0, count: 0 };
                  const loc = locations.find((l) => l.id === (a.location_id ?? null)) ?? null;
                  const subtitle = loc ? `Hely: ${loc.name}${loc.kind ? ` · ${loc.kind}` : ""}` : null;
                  const isOwn = /^saj[aá]t\b/i.test(String(a.name ?? "").trim());
                  const links = [
                    isOwn
                      ? { label: "magán→cég", className: "border-amber-500/30 bg-amber-500/10 text-amber-200", title: "Saját ingóság üzleti használat" }
                      : { label: "cég", className: "border-sky-500/30 bg-sky-500/10 text-sky-200" },
                    ...(a.project_id ? [{ label: "projekt", className: "border-violet-500/30 bg-violet-500/10 text-violet-200" }] : []),
                  ];
                  return (
                    <div key={a.id} className="relative">
                      <div className="absolute -left-[18px] top-3 h-2.5 w-2.5 rounded-full border border-border bg-slate-950" />
                      {nodeRow({
                        title: a.name,
                        subtitle,
                        badges: links,
                        kpis: [
                          {
                            label: "capex",
                            value: formatMoney(Math.round(s.capex), currency),
                            title: "beruházás — egyszeri beszerzés ezen az eszközön.",
                          },
                          {
                            label: "opex",
                            value: formatMoney(Math.round(s.opex), currency),
                            title: "üzemeltetés — folyamatos költség, nem a vételár.",
                          },
                          {
                            label: "karb",
                            value: formatMoney(Math.round(s.maint), currency),
                            title: "Karbantartás — javítás, szerviz ezen az eszközön.",
                          },
                        ],
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-[11px] text-muted-foreground">
          💡 Halmaz-kötések: a fenti csomópontok a `property_id` / `asset_id` / rendszám szövegillesztés alapján kapcsolódnak
          a tételekhez. (Ezt később lehet tovább erősíteni explicit “kötés” mezőkkel.)
        </div>
      </CardContent>
    </Card>
  );
}


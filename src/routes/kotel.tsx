import { createFileRoute, Link } from "@tanstack/react-router";

import { RopeTensionPlayer } from "@/components/rope/RopeTensionPlayer";

export const Route = createFileRoute("/kotel")({
  component: KotelPage,
  head: () => ({
    meta: [{ title: "Kötél — Szcenárió" }],
  }),
});

function KotelPage() {
  return (
    <div className="kotel-page relative flex min-h-dvh flex-col overflow-hidden text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 10% 20%, rgba(196,165,116,0.12), transparent 55%)," +
            "radial-gradient(90% 70% at 90% 70%, rgba(92,64,51,0.18), transparent 50%)," +
            "linear-gradient(165deg, var(--background) 0%, #1a1612 100%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 text-[13px]">
        <Link to="/" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Szcenárió
        </Link>
        <span className="tracking-wide text-muted-foreground">kötél · feszítés</span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-3 pb-12 pt-4 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="mb-2 text-center font-serif text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl">
            Kötél
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-center text-[14px] leading-relaxed text-muted-foreground">
            Előbb kisimul a gubanc. Aztán a jobb vég behúzza a kép széléről az arany rakományú kísérleti
            vagont — addig, amíg a megereszkedő kötél kirajzolja az írott „o” kacsáját.
          </p>
          <RopeTensionPlayer autoPlay />
        </div>
      </main>
    </div>
  );
}

/** Csomagkártyák: 3 oszlop (sm+), mobilon egymás alatt. */
export const PRICING_CARDS_GRID = "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch";

/** Összehasonlító tábla: címke + 3 csomag, mobilon vízszintesen görgethető. */
export const PRICING_ALIGN_GRID_FIXED =
  "grid grid-cols-[minmax(10rem,26%)_repeat(3,minmax(0,1fr))] gap-3 items-stretch";

/** @deprecated → PRICING_CARDS_GRID */
export const PRICING_ALIGN_GRID = PRICING_CARDS_GRID;

import type { StoreDefinition } from "@/lib/mesh/dataStore";
import type { MeshDevice } from "@/lib/mesh/device";
import type { MeshLogEntry } from "@/lib/mesh/log";
import type { PairingSession } from "@/lib/mesh/pairing";
import type { Transaction } from "@/lib/mesh/transaction";

export type UiTheme = "dark" | "light";
export type UiPalette = "slate" | "forest" | "bronze";

export type UiPrefs = {
  id: "ui";
  theme: UiTheme;
  palette?: UiPalette;
};

export type MeshSchema = {
  transactions: StoreDefinition<string, Transaction>;
  devices: StoreDefinition<string, MeshDevice>;
  logs: StoreDefinition<string, MeshLogEntry>;
  pairingSessions: StoreDefinition<string, PairingSession>;
  prefs: StoreDefinition<string, UiPrefs>;
};
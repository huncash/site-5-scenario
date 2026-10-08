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
  a11y?: boolean;
};

export type DashboardBlock = {
  id: string;
  open: boolean;
};

export type LabsEnginePref = {
  id: string;
  on: boolean;
};

export type EngineInterestRow = {
  id: string;
  clicks: number;
  starts: number;
  switches: number;
  updatedAt: number;
};

export type SalesCartRow = {
  id: string;
  lines: Array<{ sku: string; qty: number }>;
  updatedAt: number;
};

export type ModuleNotifyRow = {
  id: string;
  at: number;
};

export type BackupCueRow = {
  id: "cue";
  firstSeenAt: number;
  lastExportAt: number;
  snoozeUntil: number;
};

export type ForumNoteRow = {
  id: string;
  createdAt: number;
  kind: number;
  tags: string[][];
  content: string;
  pubkey: string;
  alias: string;
  cashHuf: number;
  monthlyOpexHuf: number;
  runwayMonths: number | null;
};

export type MeshSchema = {
  transactions: StoreDefinition<string, Transaction>;
  devices: StoreDefinition<string, MeshDevice>;
  logs: StoreDefinition<string, MeshLogEntry>;
  pairingSessions: StoreDefinition<string, PairingSession>;
  prefs: StoreDefinition<string, UiPrefs>;
  dashboardBlocks: StoreDefinition<string, DashboardBlock>;
  labsEngines: StoreDefinition<string, LabsEnginePref>;
  engineInterest: StoreDefinition<string, EngineInterestRow>;
  forumNotes: StoreDefinition<string, ForumNoteRow>;
  salesCarts: StoreDefinition<string, SalesCartRow>;
  moduleNotify: StoreDefinition<string, ModuleNotifyRow>;
  backupCue: StoreDefinition<string, BackupCueRow>;
};
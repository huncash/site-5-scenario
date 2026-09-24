import type { StoreDefinition } from "@/lib/mesh/dataStore";
import type { MeshDevice } from "@/lib/mesh/device";
import type { MeshLogEntry } from "@/lib/mesh/log";
import type { PairingSession } from "@/lib/mesh/pairing";
import type { Transaction } from "@/lib/mesh/transaction";

export type MeshSchema = {
  transactions: StoreDefinition<string, Transaction>;
  devices: StoreDefinition<string, MeshDevice>;
  logs: StoreDefinition<string, MeshLogEntry>;
  pairingSessions: StoreDefinition<string, PairingSession>;
};
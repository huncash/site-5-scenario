import { encryptJSON } from "@/lib/crypto";
import { localdb } from "@/lib/localdb";

export function szummaSnapshotLabel(profileName: string): string {
  const name = profileName.trim() || "Case";
  return `Auto backup (szumma): ${name}`;
}

export async function snapshotActiveCase(vaultKey: CryptoKey, label: string): Promise<void> {
  const dump = await localdb.exportDump();
  const enc = await encryptJSON(vaultKey, dump);
  await localdb.putSnapshot({ label, data_enc: enc });
}

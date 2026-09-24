// Local-only encrypted store on IndexedDB. Multi-profile: each profile owns
// its own salt/verifier and its own encrypted rows. The active profile is
// set by the vault after unlock; all row methods scope to it implicitly.

import type { DataStore, StoreDefinition } from "@/storage/DataStore";
import { IndexedDbDataStore } from "@/storage/indexeddb/IndexedDbDataStore";
import { decryptJSON, deriveKey, encryptJSON, importRawKey, randomSaltB64 } from "@/lib/crypto";

const DB_NAME = "finance-vault";
const DB_VERSION = 8;
const STORE_META = "meta"; // legacy (v1) — kept for migration only
const STORE_TXN = "transactions";
const STORE_GOAL = "goals";
const STORE_PROFILES = "profiles";
const STORE_SETTINGS = "settings";
const STORE_LOANS = "loans";
const STORE_BANK_RAW = "bank_raw";
const STORE_BANK_ACCOUNTS = "bank_accounts";
const STORE_BANK_ACCOUNT_WORKSPACES = "bank_account_workspaces";
const STORE_SNAPSHOTS = "snapshots";
const STORE_CATEGORY_RULES = "category_rules";

const VAULT_SESSION_KEY = "vault:key:v2";

export type BankRawRow = {
  id: string; // stable (deduped) id, e.g. bank:<workspace>:<hash>
  profile_id: string;
  workspace: string; // e.g. "Vállalkozás1"
  bank_account_id?: string | null;
  account_ref?: string | null; // from CSV (e.g. Számlaazonosító)
  ingested_at: string; // when it was imported into the vault
  booking_date_iso: string;
  value_date_iso: string;
  amount_signed: number; // bank-signed amount (income > 0, expense < 0)
  currency: string; // usually HUF
  booking_text: string;
  message: string;
  partner: string;
  partner_account: string;
  source_file?: string | null;
};

export type BankAccountRow = {
  id: string;
  profile_id: string;
  name: string;
  iban: string; // can be local account number too
  currency: string; // e.g. HUF, EUR
  bank_type: string; // MBH, OTP, Erste...
  created_at: string;
  updated_at: string;
};

export type BankAccountWorkspaceRow = {
  id: string; // `${bank_account_id}:${workspace_id}`
  profile_id: string;
  bank_account_id: string;
  workspace_id: string; // "personal" | "Vállalkozás1" | ...
  created_at: string;
};

export type Profile = {
  id: string;
  name: string;
  salt: string;
  verifier: string;
  created_at: string;
};

export type EncTxnRow = {
  id: string;
  profile_id: string;
  type: "income" | "expense" | "saving";
  occurred_at: string;
  data_enc: string;
};

export type EncGoalRow = {
  id: string;
  profile_id: string;
  deadline: string;
  is_active: boolean;
  created_at: string;
  data_enc: string;
};

export type EncSettingsRow = {
  profile_id: string;
  data_enc: string;
};

export type EncLoanRow = {
  id: string;
  profile_id: string;
  data_enc: string;
};

export type SnapshotRow = {
  id: string;
  profile_id: string;
  created_at: string;
  label: string;
  data_enc: string; // encrypted dump (encryptJSON with current vaultKey)
};

export type CategoryRuleRow = {
  id: string;
  profile_id: string;
  workspace_id: string; // "personal" | business/project id
  // Back-compat: `keyword` is the legacy "pattern" field (substring or regex with prefix "re:")
  keyword: string;
  // New rule engine fields (optional; legacy rules can omit)
  match_field?: "partner" | "description" | "accountRef" | "any" | null;
  operator?: "contains" | "equals" | "startsWith" | null;
  pattern?: string | null;
  target_category: string;
  target_partner?: string | null;
  target_type?: "income" | "expense" | "saving" | null;
  target_tags?: string[] | null;
  target_expense_type?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT" | null;
  target_muda_type?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE" | null;
  target_is_recurring?: boolean | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type FinanceDataSchema = {
  [STORE_META]: StoreDefinition<string, string>;
  [STORE_TXN]: StoreDefinition<string, EncTxnRow>;
  [STORE_GOAL]: StoreDefinition<string, EncGoalRow>;
  [STORE_PROFILES]: StoreDefinition<string, Profile>;
  [STORE_SETTINGS]: StoreDefinition<string, EncSettingsRow>;
  [STORE_LOANS]: StoreDefinition<string, EncLoanRow>;
  [STORE_BANK_RAW]: StoreDefinition<string, BankRawRow>;
  [STORE_BANK_ACCOUNTS]: StoreDefinition<string, BankAccountRow>;
  [STORE_BANK_ACCOUNT_WORKSPACES]: StoreDefinition<string, BankAccountWorkspaceRow>;
  [STORE_SNAPSHOTS]: StoreDefinition<string, SnapshotRow>;
  [STORE_CATEGORY_RULES]: StoreDefinition<string, CategoryRuleRow>;
};

let activeProfileId: string | null = null;

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const dataStore: DataStore<FinanceDataSchema> = new IndexedDbDataStore({
  name: DB_NAME,
  version: DB_VERSION,
  upgrade: (db, tx, oldVersion) => {
    if (!db.objectStoreNames.contains(STORE_META))
      db.createObjectStore(STORE_META);
    if (!db.objectStoreNames.contains(STORE_TXN))
      db.createObjectStore(STORE_TXN, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_GOAL))
      db.createObjectStore(STORE_GOAL, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_PROFILES))
      db.createObjectStore(STORE_PROFILES, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_SETTINGS))
      db.createObjectStore(STORE_SETTINGS, { keyPath: "profile_id" });
    if (!db.objectStoreNames.contains(STORE_LOANS))
      db.createObjectStore(STORE_LOANS, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_BANK_RAW))
      db.createObjectStore(STORE_BANK_RAW, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_BANK_ACCOUNTS))
      db.createObjectStore(STORE_BANK_ACCOUNTS, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_BANK_ACCOUNT_WORKSPACES))
      db.createObjectStore(STORE_BANK_ACCOUNT_WORKSPACES, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_SNAPSHOTS))
      db.createObjectStore(STORE_SNAPSHOTS, { keyPath: "id" });
    if (!db.objectStoreNames.contains(STORE_CATEGORY_RULES))
      db.createObjectStore(STORE_CATEGORY_RULES, { keyPath: "id" });

    // v1 → v2: promote the single legacy vault into a default profile,
    // then tag existing rows with its id.
    if (oldVersion > 0 && oldVersion < 2) {
      const meta = tx.objectStore(STORE_META);
      const saltReq = meta.get("salt");
      const verReq = meta.get("verifier");
      saltReq.onsuccess = () => {
        verReq.onsuccess = () => {
          const salt = saltReq.result as string | undefined;
          const verifier = verReq.result as string | undefined;
          if (!salt || !verifier) return;
          const id = newId();
          tx.objectStore(STORE_PROFILES).put({
            id,
            name: "Alapértelmezett",
            salt,
            verifier,
            created_at: new Date().toISOString(),
          } satisfies Profile);
          const tag = (store: string) => {
            const s = tx.objectStore(store);
            const cur = s.openCursor();
            cur.onsuccess = () => {
              const c = cur.result;
              if (!c) return;
              const v = c.value as { profile_id?: string };
              if (!v.profile_id) {
                v.profile_id = id;
                c.update(v);
              }
              c.continue();
            };
          };
          tag(STORE_TXN);
          tag(STORE_GOAL);
        };
      };
    }
  },
});

function requireActive(): string {
  if (!activeProfileId) throw new Error("Nincs aktív profil.");
  return activeProfileId;
}

export const localdb = {
  setActiveProfile(id: string | null) {
    activeProfileId = id;
  },
  getActiveProfile(): string | null {
    return activeProfileId;
  },

  async listProfiles(): Promise<Profile[]> {
    const rows = await dataStore.getAll(STORE_PROFILES);
    rows.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    return rows;
  },
  getProfile(id: string): Promise<Profile | undefined> {
    return dataStore.get(STORE_PROFILES, id);
  },
  async createProfile(input: {
    name: string;
    salt: string;
    verifier: string;
  }): Promise<Profile> {
    const p: Profile = {
      id: newId(),
      name: input.name.trim() || "Névtelen",
      salt: input.salt,
      verifier: input.verifier,
      created_at: new Date().toISOString(),
    };
    await dataStore.save(STORE_PROFILES, p);
    return p;
  },
  async renameProfile(id: string, name: string): Promise<void> {
    const p = await localdb.getProfile(id);
    if (!p) return;
    await dataStore.save(STORE_PROFILES, {
      ...p,
      name: name.trim() || p.name,
    });
  },
  async deleteProfile(id: string): Promise<void> {
    await dataStore.transaction(
      [
        STORE_PROFILES,
        STORE_TXN,
        STORE_GOAL,
        STORE_SETTINGS,
        STORE_LOANS,
        STORE_BANK_RAW,
        STORE_BANK_ACCOUNTS,
        STORE_BANK_ACCOUNT_WORKSPACES,
      ],
      "readwrite",
      async (transaction) => {
        const [txns, goals, loans] = await Promise.all([
          transaction.getAll(STORE_TXN),
          transaction.getAll(STORE_GOAL),
          transaction.getAll(STORE_LOANS),
        ]);
        const raws = await transaction.getAll(STORE_BANK_RAW);
        const accounts = await transaction.getAll(STORE_BANK_ACCOUNTS);
        const maps = await transaction.getAll(STORE_BANK_ACCOUNT_WORKSPACES);
        await transaction.delete(STORE_PROFILES, id);
        await transaction.delete(STORE_SETTINGS, id);
        for (const row of txns) {
          if (row.profile_id === id) {
            await transaction.delete(STORE_TXN, row.id);
          }
        }
        for (const row of goals) {
          if (row.profile_id === id) {
            await transaction.delete(STORE_GOAL, row.id);
          }
        }
        for (const row of loans) {
          if (row.profile_id === id) {
            await transaction.delete(STORE_LOANS, row.id);
          }
        }
        for (const row of raws) {
          if (row.profile_id === id) {
            await transaction.delete(STORE_BANK_RAW, row.id);
          }
        }
        for (const row of accounts) {
          if (row.profile_id === id) {
            await transaction.delete(STORE_BANK_ACCOUNTS, row.id);
          }
        }
        for (const row of maps) {
          if (row.profile_id === id) {
            await transaction.delete(STORE_BANK_ACCOUNT_WORKSPACES, row.id);
          }
        }
      },
    );
    if (activeProfileId === id) activeProfileId = null;
  },

  async exportDump(): Promise<{
    dump_version: 1;
    exported_at: string;
    db_name: string;
    db_version: number;
    stores: {
      profiles: Profile[];
      transactions: EncTxnRow[];
      goals: EncGoalRow[];
      settings: EncSettingsRow[];
      loans: EncLoanRow[];
      bank_raw: BankRawRow[];
      bank_accounts: BankAccountRow[];
      bank_account_workspaces: BankAccountWorkspaceRow[];
      snapshots: SnapshotRow[];
    };
  }> {
    return {
      dump_version: 1,
      exported_at: new Date().toISOString(),
      db_name: DB_NAME,
      db_version: DB_VERSION,
      stores: {
        profiles: await dataStore.getAll(STORE_PROFILES),
        transactions: await dataStore.getAll(STORE_TXN),
        goals: await dataStore.getAll(STORE_GOAL),
        settings: await dataStore.getAll(STORE_SETTINGS),
        loans: await dataStore.getAll(STORE_LOANS),
        bank_raw: await dataStore.getAll(STORE_BANK_RAW),
        bank_accounts: await dataStore.getAll(STORE_BANK_ACCOUNTS),
        bank_account_workspaces: await dataStore.getAll(STORE_BANK_ACCOUNT_WORKSPACES),
        snapshots: await dataStore.getAll(STORE_SNAPSHOTS),
      },
    };
  },

  async importDump(
    dump: {
      dump_version: 1;
      stores: {
        profiles: Profile[];
        transactions: EncTxnRow[];
        goals: EncGoalRow[];
        settings: EncSettingsRow[];
        loans?: EncLoanRow[];
        bank_raw: BankRawRow[];
        bank_accounts: BankAccountRow[];
        bank_account_workspaces: BankAccountWorkspaceRow[];
        snapshots?: SnapshotRow[];
      };
    },
    mode: "merge" | "replace",
  ): Promise<void> {
    const stores = [
      STORE_PROFILES,
      STORE_TXN,
      STORE_GOAL,
      STORE_SETTINGS,
      STORE_LOANS,
      STORE_BANK_RAW,
      STORE_BANK_ACCOUNTS,
      STORE_BANK_ACCOUNT_WORKSPACES,
      STORE_SNAPSHOTS,
    ] as const;

    await dataStore.transaction(stores as any, "readwrite", async (tx: any) => {
      if (mode === "replace") {
        for (const s of stores) {
          const rows = await tx.getAll(s as any);
          for (const r of rows as any[]) {
            const key = (r && typeof r === "object" && "id" in r ? (r as any).id : undefined) ?? (r as any).profile_id;
            if (key) await tx.delete(s as any, key);
          }
        }
      }

      for (const p of dump.stores.profiles ?? []) await tx.save(STORE_PROFILES as any, p as any);
      for (const r of dump.stores.transactions ?? []) await tx.save(STORE_TXN as any, r as any);
      for (const r of dump.stores.goals ?? []) await tx.save(STORE_GOAL as any, r as any);
      for (const r of dump.stores.settings ?? []) await tx.save(STORE_SETTINGS as any, r as any);
      for (const r of dump.stores.loans ?? []) await tx.save(STORE_LOANS as any, r as any);
      for (const r of dump.stores.bank_raw ?? []) await tx.save(STORE_BANK_RAW as any, r as any);
      for (const r of dump.stores.bank_accounts ?? []) await tx.save(STORE_BANK_ACCOUNTS as any, r as any);
      for (const r of dump.stores.bank_account_workspaces ?? [])
        await tx.save(STORE_BANK_ACCOUNT_WORKSPACES as any, r as any);
      for (const r of dump.stores.snapshots ?? []) await tx.save(STORE_SNAPSHOTS as any, r as any);
    });
  },

  async exportEncryptedData(input: { scope: "ALL" | string; passphrase?: string }): Promise<string> {
    const pid = requireActive();
    const cachedRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(VAULT_SESSION_KEY) : null;
    if (!cachedRaw) throw new Error("Nincs feloldott profil (vault kulcs hiányzik).");
    const vaultKey = await importRawKey(cachedRaw);

    const scope = input.scope;
    const targetWs = scope === "ALL" ? null : scope;

    const [txnsEnc, goalsEnc, loansEnc, settingsEnc, bankRaw, bankAccounts, bankMaps] = await Promise.all([
      localdb.listTxns(),
      localdb.listGoals(),
      localdb.listLoans(),
      localdb.getSettings(),
      localdb.listBankRaw().catch(() => [] as BankRawRow[]),
      localdb.listBankAccounts().catch(() => [] as BankAccountRow[]),
      localdb.listBankAccountWorkspaces().catch(() => [] as BankAccountWorkspaceRow[]),
    ]);

    const settingsPlain = settingsEnc?.data_enc ? await decryptJSON<any>(vaultKey, settingsEnc.data_enc) : null;

    const isWs = (ws: string | null) => (targetWs ? ws === targetWs : true);
    const wsOf = (p: any) => String(p?.workspace ?? p?.workspace_id ?? "personal");

    const txns: Array<{ id: string; type: EncTxnRow["type"]; occurred_at: string; payload: any }> = [];
    for (const r of txnsEnc) {
      const p = await decryptJSON<any>(vaultKey, r.data_enc);
      if (!isWs(wsOf(p))) continue;
      txns.push({ id: r.id, type: r.type, occurred_at: r.occurred_at, payload: p });
    }

    const goals: Array<{ id: string; deadline: string; is_active: boolean; created_at: string; payload: any }> = [];
    for (const r of goalsEnc) {
      const p = await decryptJSON<any>(vaultKey, r.data_enc);
      if (!isWs(wsOf(p))) continue;
      goals.push({ id: r.id, deadline: r.deadline, is_active: r.is_active, created_at: r.created_at, payload: p });
    }

    const loans: Array<{ id: string; payload: any }> = [];
    for (const r of loansEnc) {
      const p = await decryptJSON<any>(vaultKey, r.data_enc);
      const ws = String(p?.workspace_id ?? p?.workspace ?? "personal");
      if (!isWs(ws)) continue;
      loans.push({ id: r.id, payload: p });
    }

    const bankRawScoped = (bankRaw ?? []).filter((r) => r.profile_id === pid).filter((r) => isWs(r.workspace));
    const mapsScoped = (bankMaps ?? [])
      .filter((r) => r.profile_id === pid)
      .filter((r) => (targetWs ? r.workspace_id === targetWs : true));
    const accountIds = new Set<string>();
    for (const m of mapsScoped) accountIds.add(m.bank_account_id);
    for (const r of bankRawScoped) if (r.bank_account_id) accountIds.add(r.bank_account_id);
    const accountsScoped = (bankAccounts ?? [])
      .filter((r) => r.profile_id === pid)
      .filter((r) => (targetWs ? accountIds.has(r.id) : true));

    const plain = {
      app: "Mesh Data Manager" as const,
      version: DB_VERSION,
      timestamp: new Date().toISOString(),
      scope: input.scope,
      profile_id: pid,
      data: {
        settings: settingsPlain,
        transactions: txns,
        goals,
        loans,
        bank_raw: bankRawScoped,
        bank_accounts: accountsScoped,
        bank_account_workspaces: mapsScoped,
      },
    };

    const passphrase = input.passphrase?.trim() || "";
    if (passphrase) {
      const salt = randomSaltB64();
      const k = await deriveKey(passphrase, salt);
      const enc = await encryptJSON(k, plain);
      return JSON.stringify(
        {
          app: "Mesh Data Manager",
          version: DB_VERSION,
          timestamp: plain.timestamp,
          scope: input.scope,
          kdf: { kind: "pbkdf2", salt_b64: salt, hash: "SHA-256" },
          cipher: JSON.parse(enc) as unknown,
        },
        null,
        2,
      );
    }

    const enc = await encryptJSON(vaultKey, plain);
    return JSON.stringify(
      {
        app: "Mesh Data Manager",
        version: DB_VERSION,
        timestamp: plain.timestamp,
        scope: input.scope,
        kdf: { kind: "internal-vault" },
        cipher: JSON.parse(enc) as unknown,
      },
      null,
      2,
    );
  },

  async importEncryptedData(
    fileContent: string,
    passphrase: string,
    mode: "OVERWRITE" | "MERGE",
  ): Promise<void> {
    const pid = requireActive();
    const cachedRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(VAULT_SESSION_KEY) : null;
    if (!cachedRaw) throw new Error("Nincs feloldott profil (vault kulcs hiányzik).");
    const vaultKey = await importRawKey(cachedRaw);

    let env: any;
    try {
      env = JSON.parse(fileContent);
    } catch {
      throw new Error("Nem érvényes JSON mentés.");
    }
    if (!env || env.app !== "Mesh Data Manager") throw new Error("Ismeretlen mentés formátum.");
    if (typeof env.version !== "number" || env.version !== DB_VERSION) throw new Error("Mentés verzió eltérés.");
    if (!env.cipher) throw new Error("Hiányzó titkosított payload.");

    let decryptKey: CryptoKey;
    if (env.kdf?.kind === "pbkdf2") {
      const pw = (passphrase ?? "").trim();
      if (!pw) throw new Error("Jelszó szükséges ehhez a mentéshez.");
      decryptKey = await deriveKey(pw, String(env.kdf.salt_b64 ?? ""));
    } else if (env.kdf?.kind === "internal-vault") {
      decryptKey = vaultKey;
    } else {
      throw new Error("Ismeretlen kulcsszármaztatás (kdf).");
    }

    const plain = await decryptJSON<any>(decryptKey, JSON.stringify(env.cipher));
    if (!plain || plain.app !== "Mesh Data Manager") throw new Error("Payload sérült / ismeretlen.");

    const scope = plain.scope as "ALL" | string;
    const targetWs = scope === "ALL" ? null : String(scope);

    const toEnc = async (obj: any) => encryptJSON(vaultKey, obj);

    const purgeWorkspace = async (workspaceId: string) => {
      await dataStore.transaction(
        [STORE_TXN, STORE_GOAL, STORE_LOANS, STORE_BANK_RAW, STORE_BANK_ACCOUNTS, STORE_BANK_ACCOUNT_WORKSPACES, STORE_SETTINGS] as any,
        "readwrite",
        async (tx: any) => {
          const txns: EncTxnRow[] = await tx.getAll(STORE_TXN as any);
          for (const r of txns) {
            if (r.profile_id !== pid) continue;
            try {
              const p = await decryptJSON<any>(vaultKey, r.data_enc);
              const ws = String(p?.workspace ?? p?.workspace_id ?? "personal");
              if (ws === workspaceId) await tx.delete(STORE_TXN as any, r.id);
            } catch {
              /* ignore undecodable rows */
            }
          }
          const goals: EncGoalRow[] = await tx.getAll(STORE_GOAL as any);
          for (const r of goals) {
            if (r.profile_id !== pid) continue;
            try {
              const p = await decryptJSON<any>(vaultKey, r.data_enc);
              const ws = String(p?.workspace ?? p?.workspace_id ?? "personal");
              if (ws === workspaceId) await tx.delete(STORE_GOAL as any, r.id);
            } catch {
              /* ignore */
            }
          }
          const loans: EncLoanRow[] = await tx.getAll(STORE_LOANS as any);
          for (const r of loans) {
            if (r.profile_id !== pid) continue;
            try {
              const p = await decryptJSON<any>(vaultKey, r.data_enc);
              const ws = String(p?.workspace_id ?? p?.workspace ?? "personal");
              if (ws === workspaceId) await tx.delete(STORE_LOANS as any, r.id);
            } catch {
              /* ignore */
            }
          }
          const raws: BankRawRow[] = await tx.getAll(STORE_BANK_RAW as any);
          for (const r of raws) {
            if (r.profile_id === pid && r.workspace === workspaceId) await tx.delete(STORE_BANK_RAW as any, r.id);
          }
          const maps: BankAccountWorkspaceRow[] = await tx.getAll(STORE_BANK_ACCOUNT_WORKSPACES as any);
          for (const r of maps) {
            if (r.profile_id === pid && r.workspace_id === workspaceId) await tx.delete(STORE_BANK_ACCOUNT_WORKSPACES as any, r.id);
          }
        },
      );
    };

    const purgeAllForProfile = async () => {
      await dataStore.transaction(
        [STORE_TXN, STORE_GOAL, STORE_LOANS, STORE_BANK_RAW, STORE_BANK_ACCOUNTS, STORE_BANK_ACCOUNT_WORKSPACES, STORE_SETTINGS] as any,
        "readwrite",
        async (tx: any) => {
          const wipeStore = async (store: string) => {
            const rows = await tx.getAll(store as any);
            for (const r of rows as any[]) {
              if (r && typeof r === "object" && "profile_id" in r && r.profile_id !== pid) continue;
              const key = (r && typeof r === "object" && "id" in r ? r.id : undefined) ?? r.profile_id;
              if (key) await tx.delete(store as any, key);
            }
          };
          await wipeStore(STORE_TXN);
          await wipeStore(STORE_GOAL);
          await wipeStore(STORE_LOANS);
          await wipeStore(STORE_BANK_RAW);
          await wipeStore(STORE_BANK_ACCOUNTS);
          await wipeStore(STORE_BANK_ACCOUNT_WORKSPACES);
          await wipeStore(STORE_SETTINGS);
        },
      );
    };

    if (mode === "OVERWRITE") {
      if (targetWs) await purgeWorkspace(targetWs);
      else await purgeAllForProfile();
    }

    // Settings: ALL replaces; workspace scope merges the one meta (best-effort).
    if (plain.data?.settings) {
      if (!targetWs) {
        await localdb.putSettings(await toEnc(plain.data.settings));
      } else {
        const curEnc = await localdb.getSettings();
        const cur = curEnc?.data_enc ? await decryptJSON<any>(vaultKey, curEnc.data_enc) : {};
        const next = { ...(cur ?? {}) };
        if (Array.isArray(cur?.workspaces) && Array.isArray(plain.data.settings?.workspaces)) {
          const incoming = plain.data.settings.workspaces.find((w: any) => String(w?.id) === targetWs) ?? null;
          if (incoming) {
            const rest = (cur.workspaces as any[]).filter((w: any) => String(w?.id) !== targetWs);
            next.workspaces = [...rest, incoming];
          }
        }
        await localdb.putSettings(await toEnc(next));
      }
    }

    for (const t of plain.data?.transactions ?? []) {
      const data_enc = await toEnc(t.payload);
      await localdb.putTxn({ id: t.id, type: t.type, occurred_at: t.occurred_at, data_enc, profile_id: pid });
    }
    for (const g of plain.data?.goals ?? []) {
      const data_enc = await toEnc(g.payload);
      await localdb.putGoal({
        id: g.id,
        deadline: g.deadline,
        is_active: Boolean(g.is_active),
        created_at: g.created_at ?? new Date().toISOString(),
        data_enc,
        profile_id: pid,
      });
    }
    for (const l of plain.data?.loans ?? []) {
      const data_enc = await toEnc(l.payload);
      await localdb.putLoan({ id: l.id, data_enc, profile_id: pid });
    }
    for (const r of plain.data?.bank_raw ?? []) {
      await dataStore.save(STORE_BANK_RAW, { ...r, profile_id: pid });
    }
    for (const a of plain.data?.bank_accounts ?? []) {
      await dataStore.save(STORE_BANK_ACCOUNTS, { ...a, profile_id: pid });
    }
    for (const m of plain.data?.bank_account_workspaces ?? []) {
      await dataStore.save(STORE_BANK_ACCOUNT_WORKSPACES, { ...m, profile_id: pid });
    }
  },

  async listSnapshots(): Promise<SnapshotRow[]> {
    const pid = requireActive();
    const rows = (await dataStore.getAll(STORE_SNAPSHOTS)).filter((r) => r.profile_id === pid);
    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return rows;
  },

  async putSnapshot(input: { label: string; data_enc: string }): Promise<SnapshotRow> {
    const pid = requireActive();
    const row: SnapshotRow = {
      id: newId(),
      profile_id: pid,
      created_at: new Date().toISOString(),
      label: input.label.trim() || "Snapshot",
      data_enc: input.data_enc,
    };
    await dataStore.save(STORE_SNAPSHOTS, row);
    return row;
  },

  async deleteSnapshot(id: string): Promise<void> {
    await dataStore.delete(STORE_SNAPSHOTS, id);
  },

  async getSettings(): Promise<EncSettingsRow | undefined> {
    const pid = requireActive();
    return dataStore.get(STORE_SETTINGS, pid);
  },
  async putSettings(data_enc: string): Promise<void> {
    const pid = requireActive();
    await dataStore.save(STORE_SETTINGS, { profile_id: pid, data_enc });
  },
  async putSettingsFor(profile_id: string, data_enc: string): Promise<void> {
    await dataStore.save(STORE_SETTINGS, { profile_id, data_enc });
  },

  async listTxns(): Promise<EncTxnRow[]> {
    const pid = requireActive();
    const rows = await dataStore.getAll(STORE_TXN);
    return rows.filter((r) => r.profile_id === pid);
  },
  async getTxn(id: string): Promise<EncTxnRow | undefined> {
    return dataStore.get(STORE_TXN, id);
  },
  async listGoals(): Promise<EncGoalRow[]> {
    const pid = requireActive();
    const rows = await dataStore.getAll(STORE_GOAL);
    return rows.filter((r) => r.profile_id === pid);
  },

  async listLoans(): Promise<EncLoanRow[]> {
    const pid = requireActive();
    const rows = await dataStore.getAll(STORE_LOANS);
    return rows.filter((r) => r.profile_id === pid);
  },
  async getLoan(id: string): Promise<EncLoanRow | undefined> {
    return dataStore.get(STORE_LOANS, id);
  },
  putLoan(row: Omit<EncLoanRow, "profile_id"> & { profile_id?: string }) {
    const pid = row.profile_id ?? requireActive();
    return dataStore.save(STORE_LOANS, { ...row, profile_id: pid });
  },
  deleteLoan(id: string) {
    return dataStore.delete(STORE_LOANS, id);
  },
  putTxn(row: Omit<EncTxnRow, "profile_id"> & { profile_id?: string }) {
    const pid = row.profile_id ?? requireActive();
    return dataStore.save(STORE_TXN, { ...row, profile_id: pid });
  },
  deleteTxn(id: string) {
    return dataStore.delete(STORE_TXN, id);
  },
  putGoal(row: Omit<EncGoalRow, "profile_id"> & { profile_id?: string }) {
    const pid = row.profile_id ?? requireActive();
    return dataStore.save(STORE_GOAL, { ...row, profile_id: pid });
  },
  deleteGoal(id: string) {
    return dataStore.delete(STORE_GOAL, id);
  },
  async setGoalActive(id: string): Promise<void> {
    const pid = requireActive();
    await dataStore.transaction(
      [STORE_GOAL],
      "readwrite",
      async (transaction) => {
        const goals = await transaction.getAll(STORE_GOAL);
        for (const goal of goals) {
          if (goal.profile_id !== pid) continue;
          await transaction.save(STORE_GOAL, {
            ...goal,
            is_active: goal.id === id,
          });
        }
      },
    );
  },

  async wipe(): Promise<void> {
    activeProfileId = null;
    await dataStore.reset();
  },

  async getBankRaw(id: string): Promise<BankRawRow | undefined> {
    return dataStore.get(STORE_BANK_RAW, id);
  },
  async listBankRaw(): Promise<BankRawRow[]> {
    const pid = requireActive();
    const rows = await dataStore.getAll(STORE_BANK_RAW);
    return rows.filter((r) => r.profile_id === pid);
  },
  async putBankRaw(
    row: Omit<BankRawRow, "profile_id"> & { profile_id?: string },
  ): Promise<"inserted" | "exists"> {
    const pid = row.profile_id ?? requireActive();
    const existing = await dataStore.get(STORE_BANK_RAW, row.id);
    if (existing) return "exists";
    await dataStore.save(STORE_BANK_RAW, { ...row, profile_id: pid });
    return "inserted";
  },
  deleteBankRaw(id: string) {
    return dataStore.delete(STORE_BANK_RAW, id);
  },

  async listBankAccounts(): Promise<BankAccountRow[]> {
    const pid = requireActive();
    const rows = await dataStore.getAll(STORE_BANK_ACCOUNTS);
    return rows.filter((r) => r.profile_id === pid).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  },
  async putBankAccount(
    row: Omit<BankAccountRow, "id" | "profile_id" | "created_at" | "updated_at"> & { id?: string; profile_id?: string },
  ): Promise<BankAccountRow> {
    const pid = row.profile_id ?? requireActive();
    const now = new Date().toISOString();
    const existing = row.id ? await dataStore.get(STORE_BANK_ACCOUNTS, row.id) : undefined;
    const acc: BankAccountRow = {
      id: existing?.id ?? row.id ?? newId(),
      profile_id: pid,
      name: row.name.trim() || existing?.name || "Bankszámla",
      iban: row.iban.trim(),
      currency: row.currency.trim().toUpperCase() || "HUF",
      bank_type: row.bank_type.trim() || "MBH",
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
    await dataStore.save(STORE_BANK_ACCOUNTS, acc);
    return acc;
  },
  async deleteBankAccount(id: string): Promise<void> {
    const pid = requireActive();
    await dataStore.transaction(
      [STORE_BANK_ACCOUNTS, STORE_BANK_ACCOUNT_WORKSPACES],
      "readwrite",
      async (tx) => {
        const maps = await tx.getAll(STORE_BANK_ACCOUNT_WORKSPACES);
        for (const m of maps) {
          if (m.profile_id === pid && m.bank_account_id === id) {
            await tx.delete(STORE_BANK_ACCOUNT_WORKSPACES, m.id);
          }
        }
        await tx.delete(STORE_BANK_ACCOUNTS, id);
      },
    );
  },
  async listBankAccountWorkspaces(): Promise<BankAccountWorkspaceRow[]> {
    const pid = requireActive();
    const rows = await dataStore.getAll(STORE_BANK_ACCOUNT_WORKSPACES);
    return rows.filter((r) => r.profile_id === pid);
  },
  async setBankAccountWorkspaceMapping(input: {
    bank_account_id: string;
    workspace_id: string;
    enabled: boolean;
  }): Promise<void> {
    const pid = requireActive();
    const id = `${input.bank_account_id}:${input.workspace_id}`;
    if (!input.enabled) {
      await dataStore.delete(STORE_BANK_ACCOUNT_WORKSPACES, id);
      return;
    }
    await dataStore.save(STORE_BANK_ACCOUNT_WORKSPACES, {
      id,
      profile_id: pid,
      bank_account_id: input.bank_account_id,
      workspace_id: input.workspace_id,
      created_at: new Date().toISOString(),
    } satisfies BankAccountWorkspaceRow);
  },

  async listCategoryRules(workspace_id?: string | null): Promise<CategoryRuleRow[]> {
    const pid = requireActive();
    const rows = await dataStore.getAll(STORE_CATEGORY_RULES);
    const scoped = rows.filter((r) => r.profile_id === pid);
    const filtered = workspace_id ? scoped.filter((r) => r.workspace_id === workspace_id) : scoped;
    filtered.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
    return filtered;
  },

  async putCategoryRule(
    input: Omit<CategoryRuleRow, "id" | "profile_id" | "created_at" | "updated_at"> & { id?: string },
  ): Promise<CategoryRuleRow> {
    const pid = requireActive();
    const now = new Date().toISOString();
    const existing = input.id ? await dataStore.get(STORE_CATEGORY_RULES, input.id) : undefined;
    const keyword = String((input.pattern ?? input.keyword ?? existing?.pattern ?? existing?.keyword ?? "")).trim();
    const row: CategoryRuleRow = {
      id: existing?.id ?? input.id ?? newId(),
      profile_id: pid,
      workspace_id: input.workspace_id,
      keyword,
      pattern: String((input.pattern ?? input.keyword ?? existing?.pattern ?? existing?.keyword ?? "")).trim() || null,
      match_field: (input.match_field ?? existing?.match_field ?? null) as any,
      operator: (input.operator ?? existing?.operator ?? null) as any,
      target_category: String(input.target_category ?? "").trim(),
      target_partner: input.target_partner ?? null,
      target_type: (input.target_type as any) ?? null,
      target_tags: Array.isArray((input as any).target_tags) ? ((input as any).target_tags as string[]) : existing?.target_tags ?? null,
      target_expense_type: ((input as any).target_expense_type ?? existing?.target_expense_type ?? null) as any,
      target_muda_type: ((input as any).target_muda_type ?? existing?.target_muda_type ?? null) as any,
      target_is_recurring:
        typeof (input as any).target_is_recurring === "boolean"
          ? ((input as any).target_is_recurring as boolean)
          : existing?.target_is_recurring ?? null,
      is_active: Boolean(input.is_active),
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
    await dataStore.save(STORE_CATEGORY_RULES, row);
    return row;
  },

  async deleteCategoryRule(id: string): Promise<void> {
    await dataStore.delete(STORE_CATEGORY_RULES, id);
  },
};

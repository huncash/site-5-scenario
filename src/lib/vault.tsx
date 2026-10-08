import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  checkVerifier,
  deriveKey,
  exportRawKey,
  importRawKey,
  makeVerifier,
  randomSaltB64,
} from "@/lib/crypto";
import { markDemoCaseEngines } from "@/lib/engineFrames";
import { localdb, type Profile } from "@/lib/localdb";

function syncDemoCaseEngines(name: unknown) {
  markDemoCaseEngines(String(name ?? "").trim().startsWith("DEMO "));
}

type VaultState =
  | { status: "loading" }
  | { status: "no-profiles" }
  | { status: "picker"; profiles: Profile[] }
  | { status: "creating"; profiles: Profile[] }
  | { status: "locked"; profile: Profile }
  | { status: "unlocked"; profile: Profile; key: CryptoKey };

type VaultContextValue = {
  state: VaultState;
  createProfile: (name: string, password: string) => Promise<void>;
  selectProfile: (id: string) => Promise<void>;
  beginCreate: () => Promise<void>;
  cancelCreate: () => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  unlockById: (id: string, password: string) => Promise<boolean>;
  lock: () => Promise<void>;
  backToPicker: () => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  renameProfile: (id: string, name: string) => Promise<void>;
};

const VaultContext = createContext<VaultContextValue | null>(null);

// Session-only key cache: cleared on tab close or explicit lock.
const SS_KEY = "vault:key:v2";
const SS_PROFILE = "vault:profile:v2";

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VaultState>({ status: "loading" });

  const bootstrap = useCallback(async () => {
    const profiles = await localdb.listProfiles();
    if (profiles.length === 0) {
      localdb.setActiveProfile(null);
      markDemoCaseEngines(false);
      setState({ status: "no-profiles" });
      return;
    }

    const cachedKey = sessionStorage.getItem(SS_KEY);
    const cachedProfileId = sessionStorage.getItem(SS_PROFILE);
    const cachedProfile = cachedProfileId
      ? profiles.find((p) => p.id === cachedProfileId)
      : null;
    if (cachedKey && cachedProfile) {
      try {
        const key = await importRawKey(cachedKey);
        if (await checkVerifier(key, cachedProfile.verifier)) {
          localdb.setActiveProfile(cachedProfile.id);
          syncDemoCaseEngines(cachedProfile.name);
          setState({ status: "unlocked", profile: cachedProfile, key });
          return;
        }
      } catch {
        /* fall through */
      }
      sessionStorage.removeItem(SS_KEY);
      sessionStorage.removeItem(SS_PROFILE);
    }

    localdb.setActiveProfile(null);
    markDemoCaseEngines(false);
    setState({ status: "picker", profiles });
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  async function cacheKey(key: CryptoKey, profileId: string) {
    const raw = await exportRawKey(key);
    sessionStorage.setItem(SS_KEY, raw);
    sessionStorage.setItem(SS_PROFILE, profileId);
  }

  const createProfile: VaultContextValue["createProfile"] = async (
    name,
    password,
  ) => {
    const salt = randomSaltB64();
    const key = await deriveKey(password, salt);
    const verifier = await makeVerifier(key);
    const profile = await localdb.createProfile({ name, salt, verifier });
    localdb.setActiveProfile(profile.id);
    await cacheKey(key, profile.id);
    setState({ status: "unlocked", profile, key });
  };

  const selectProfile: VaultContextValue["selectProfile"] = async (id) => {
    const profile = await localdb.getProfile(id);
    if (!profile) {
      await bootstrap();
      return;
    }
    localdb.setActiveProfile(null);
    setState({ status: "locked", profile });
  };

  const unlock: VaultContextValue["unlock"] = async (password) => {
    if (state.status !== "locked") return false;
    const key = await deriveKey(password, state.profile.salt);
    const ok = await checkVerifier(key, state.profile.verifier);
    if (!ok) return false;
    localdb.setActiveProfile(state.profile.id);
    await cacheKey(key, state.profile.id);
    syncDemoCaseEngines(state.profile.name);
    setState({ status: "unlocked", profile: state.profile, key });
    return true;
  };

  const unlockById: VaultContextValue["unlockById"] = async (id, password) => {
    const profile = await localdb.getProfile(id);
    if (!profile) return false;
    const key = await deriveKey(password, profile.salt);
    const ok = await checkVerifier(key, profile.verifier);
    if (!ok) return false;
    localdb.setActiveProfile(profile.id);
    await cacheKey(key, profile.id);
    syncDemoCaseEngines(profile.name);
    setState({ status: "unlocked", profile, key });
    return true;
  };

  const lock: VaultContextValue["lock"] = async () => {
    sessionStorage.removeItem(SS_KEY);
    sessionStorage.removeItem(SS_PROFILE);
    localdb.setActiveProfile(null);
    markDemoCaseEngines(false);
    await bootstrap();
  };

  const backToPicker: VaultContextValue["backToPicker"] = async () => {
    sessionStorage.removeItem(SS_KEY);
    sessionStorage.removeItem(SS_PROFILE);
    localdb.setActiveProfile(null);
    markDemoCaseEngines(false);
    const profiles = await localdb.listProfiles();
    if (profiles.length === 0) setState({ status: "no-profiles" });
    else setState({ status: "picker", profiles });
  };

  const beginCreate: VaultContextValue["beginCreate"] = async () => {
    const profiles = await localdb.listProfiles();
    setState({ status: "creating", profiles });
  };

  const cancelCreate: VaultContextValue["cancelCreate"] = async () => {
    await bootstrap();
  };

  const deleteProfile: VaultContextValue["deleteProfile"] = async (id) => {
    await localdb.deleteProfile(id);
    if (state.status === "unlocked" && state.profile.id === id) {
      sessionStorage.removeItem(SS_KEY);
      sessionStorage.removeItem(SS_PROFILE);
    }
    await bootstrap();
  };

  const renameProfile: VaultContextValue["renameProfile"] = async (id, name) => {
    await localdb.renameProfile(id, name);
    if (state.status === "unlocked" && state.profile.id === id) {
      setState({ ...state, profile: { ...state.profile, name } });
    } else {
      await bootstrap();
    }
  };

  return (
    <VaultContext.Provider
      value={{
        state,
        createProfile,
        selectProfile,
        beginCreate,
        cancelCreate,
        unlock,
        unlockById,
        lock,
        backToPicker,
        deleteProfile,
        renameProfile,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault outside VaultProvider");
  return ctx;
}

export function useVaultKey(): CryptoKey | null {
  const { state } = useVault();
  return state.status === "unlocked" ? state.key : null;
}

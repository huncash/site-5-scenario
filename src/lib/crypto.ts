// End-to-end encryption primitives.
// PBKDF2-SHA256 (600k iterations) → AES-GCM-256. All operations run in the
// browser via WebCrypto; the master password never leaves the device.

const PBKDF2_ITER = 600_000;
const VERIFIER_PLAINTEXT = "vault-ok-v1";

// Some TS libdom versions type Uint8Array as Uint8Array<ArrayBufferLike>,
// which doesn't satisfy BufferSource (SharedArrayBuffer branch). Normalize.
function buf(bytes: Uint8Array): BufferSource {
  return bytes as unknown as BufferSource;
}

const b64 = {
  enc(bytes: ArrayBuffer | Uint8Array): string {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let s = "";
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  },
  dec(s: string): Uint8Array {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  },
};

export function randomSaltB64(): string {
  return b64.enc(crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveKey(password: string, saltB64: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    buf(new TextEncoder().encode(password)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: buf(b64.dec(saltB64)),
      iterations: PBKDF2_ITER,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    true, // extractable — required to cache in sessionStorage across page loads
    ["encrypt", "decrypt"],
  );
}

export async function importRawKey(rawB64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    buf(b64.dec(rawB64)),
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function exportRawKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return b64.enc(raw);
}

export async function encryptString(key: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: buf(iv) },
    key,
    buf(new TextEncoder().encode(plaintext)),
  );
  return JSON.stringify({ v: 1, iv: b64.enc(iv), ct: b64.enc(ct) });
}

export async function decryptString(key: CryptoKey, blob: string): Promise<string> {
  const parsed = JSON.parse(blob) as { iv: string; ct: string };
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: buf(b64.dec(parsed.iv)) },
    key,
    buf(b64.dec(parsed.ct)),
  );
  return new TextDecoder().decode(pt);
}

export async function encryptJSON<T>(key: CryptoKey, obj: T): Promise<string> {
  return encryptString(key, JSON.stringify(obj));
}

export async function decryptJSON<T>(key: CryptoKey, blob: string): Promise<T> {
  return JSON.parse(await decryptString(key, blob)) as T;
}

export async function makeVerifier(key: CryptoKey): Promise<string> {
  return encryptString(key, VERIFIER_PLAINTEXT);
}

export async function checkVerifier(key: CryptoKey, verifier: string): Promise<boolean> {
  try {
    return (await decryptString(key, verifier)) === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}

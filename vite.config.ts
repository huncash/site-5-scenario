// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { createHash } from "node:crypto";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function sha256(s: string) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

const adminPlain = String(process.env.ADMIN_PASSPHRASE || process.env.VITE_ADMIN_PASSPHRASE || "").trim();
const adminHashEnv = String(process.env.VITE_ADMIN_PASSPHRASE_HASH || "").trim().toLowerCase();
const injectedAdminHash = adminHashEnv || (adminPlain ? sha256(adminPlain) : "");

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      __MAINTENANCE_ADMIN_HASH__: JSON.stringify(injectedAdminHash),
    },
    server: {
      proxy: {
        "/api/billing": {
          target: "http://127.0.0.1:5110",
          changeOrigin: true,
        },
        "/mnb-rates": {
          target: "http://www.mnb.hu",
          changeOrigin: true,
          rewrite: () => "/arfolyamok.asmx",
        },
      },
    },
  },
});

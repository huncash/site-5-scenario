import { createHash } from "node:crypto";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const envDir = fileURLToPath(new URL("..", import.meta.url));

function sha256(s: string) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");
  const adminPlain = String(env.ADMIN_PASSPHRASE || env.VITE_ADMIN_PASSPHRASE || "").trim();
  const adminHashEnv = String(env.VITE_ADMIN_PASSPHRASE_HASH || "").trim().toLowerCase();
  const injectedAdminHash = adminHashEnv || (adminPlain ? sha256(adminPlain) : "");
  return {
  root,
  envDir,
  define: {
    __MAINTENANCE_ADMIN_HASH__: JSON.stringify(injectedAdminHash),
  },
  plugins: [react(), tailwindcss()],
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
    },
  },
  server: { port: 5120, host: true, allowedHosts: true },
  preview: { port: 5120, host: true, allowedHosts: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
};
});

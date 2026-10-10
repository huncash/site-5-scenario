import { createHash } from "node:crypto";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

function sha256(s: string) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

const root = fileURLToPath(new URL(".", import.meta.url));
const envDir = fileURLToPath(new URL("..", import.meta.url));

function barionPixelPlugin(pixelId: string): Plugin {
  return {
    name: "barion-pixel-id",
    transformIndexHtml(html) {
      const id = /^BP-/.test(pixelId) ? pixelId : "";
      let out = html.replaceAll("__BARION_PIXEL_ID__", id);
      if (!id) {
        out = out.replace(/<noscript>\s*<img[^>]*Barion Pixel[^>]*>\s*<\/noscript>/i, "");
      }
      return out;
    },
  };
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
    plugins: [react(), tailwindcss(), barionPixelPlugin((env.BARION_PIXEL_ID ?? "").trim())],
    publicDir: fileURLToPath(new URL("../public", import.meta.url)),
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("../src", import.meta.url)),
      },
    },
    server: {
      port: 5110,
      host: true,
      allowedHosts: true,
    },
    preview: {
      port: 5110,
      host: true,
      allowedHosts: true,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});

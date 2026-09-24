// VPS Node target — külön a Lovable/Cloudflare vite.config.ts-től.
// Használat: npm run build:node
// Output: .output/server/index.mjs + .output/public/
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  server: { port: 4111, host: true },
  preview: { port: 4111, host: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

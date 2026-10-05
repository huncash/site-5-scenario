import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "support/src/**/*.test.ts", "scripts/**/*.test.mjs"],
    exclude: ["node_modules", "dist"],
  },
});


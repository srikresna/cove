import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // biome-ignore lint/suspicious/noExplicitAny: vitest bundles its own vite copy, causing a dual-PluginOption type mismatch that is runtime-irrelevant
  plugins: [react()] as any,
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "src-tauri", "dist"],
    // node: builtin modules (the migration tests run real SQLite) must stay
    // external to vite's transform.
    server: { deps: { external: [/^node:/] } },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/services/**",
        "src/errors/**",
        "src/domain/**",
        "src/store/**",
        "src/utils/**",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});

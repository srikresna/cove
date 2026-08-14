import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { transform } from "esbuild";
import { visualizer } from "rollup-plugin-visualizer";
import { type Plugin, defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * BlockSuite source uses the `accessor` keyword (TC39 stage 3 class fields).
 * Rollup's parser cannot handle it; esbuild downgrades it with target < es2022.
 * This only runs on .ts files that contain `accessor` — minimal overhead.
 */
function accessorTransformPlugin(): Plugin {
  return {
    name: "cove:accessor-transform",
    enforce: "pre",
    async transform(code, id) {
      if (!id.includes("blocksuite") && !id.includes("Affine")) return;
      if (!id.endsWith(".ts")) return;
      if (!code.includes("accessor ")) return;
      try {
        const result = await transform(code, { loader: "ts", target: "es2021" });
        return { code: result.code };
      } catch {
        return null;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    accessorTransformPlugin(),
    vanillaExtractPlugin(),
    wasm(),
    react(),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: "stats.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  clearScreen: false,
  resolve: {
    // ── Single-copy resolution for BlockSuite's core libraries ────────────
    // With vendored BlockSuite packages in ./vendor/ (junctions in
    // node_modules/@blocksuite/), all transitive deps (yjs, rxjs, pdfmake, …)
    // resolve from Cove's own node_modules — no more AFFiNE/ directory needed.
    // Only @preact/signals-core is pinned to Cove's copy for signal-propagation
    // compatibility with BlockSuite 0.27.
    alias: [
      {
        find: /^@preact\/signals-core(?=\/|$)/,
        replacement: resolve(rootDir, "node_modules/@preact/signals-core"),
      },
    ],
    dedupe: [
      "@blocksuite/global",
      "@blocksuite/std",
      "@blocksuite/store",
      "@blocksuite/sync",
      "@preact/signals-core",
      "yjs",
    ],
  },
  optimizeDeps: {
    entries: ["index.html", "src/components/editor/blocksuite/**/*.{ts,tsx}"],
    exclude: ["@vanilla-extract/css", "@vanilla-extract/private"],
  },
  server: {
    port: 1420,
    strictPort: true,
    fs: {
      // Cove is fully self-contained: BlockSuite + templates are vendored in
      // ./vendor/ (junctions in node_modules/), and yjs/signals resolve from
      // Cove's own node_modules. No external AFFiNE/ sibling needed.
      allow: [rootDir],
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@blocksuite")) return "vendor-blocksuite";
            if (id.includes("yjs")) return "vendor-yjs";
            if (id.includes("@radix-ui") || id.includes("cmdk")) return "vendor-ui-primitives";
            if (id.includes("lucide-react") || id.includes("framer-motion"))
              return "vendor-icons-animation";
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")
            )
              return "vendor-react";
          }
        },
      },
    },
  },
});

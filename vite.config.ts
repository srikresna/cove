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
    // Cove consumes BlockSuite through symlinks into ./AFFiNE. Without this,
    // Vite resolves `yjs`/`@preact/signals-core` per-file: Cove's own imports
    // (src/**) hit cove/node_modules while BlockSuite hits Affine/node_modules.
    // Two physical copies at runtime is catastrophic for CRDTs and signals:
    // separate copies mean signal/effect subscriptions never connect (toolbar
    // active-state, renderer refresh) and Y.applyUpdate/encodeStateAsUpdate
    // mutate doc.spaceDoc across the boundary → corrupted surface.
    //
    // IMPORTANT: we alias to AFFINE's copies, not Cove's. BlockSuite 0.27 is
    // built and tested against yjs 13.6.21 / @preact/signals-core 1.8.0. Running
    // it against Cove's newer copies (signals 1.14.4) changed signal-propagation
    // semantics enough that BlockSuite's toolbar flag `refresh()` chain (which
    // toggles a flag bit off→on inside a batch to force re-render) became a
    // no-op — so the toolbar content never re-rendered on element property
    // changes (stroke style / shape style active-state stayed stale until
    // reselect). Pinning to the versions BlockSuite expects fixes that.
    // Regex matches the bare package + subpaths but NOT lookalikes (yjs-webrtc).
    alias: [
      {
        find: "@affine/templates/stickers",
        replacement: resolve(
          rootDir,
          "AFFiNE/packages/frontend/templates/stickers-templates.gen.ts",
        ),
      },
      {
        find: "@affine/templates/edgeless",
        replacement: resolve(
          rootDir,
          "AFFiNE/packages/frontend/templates/edgeless-templates.gen.ts",
        ),
      },
      {
        find: /^yjs(?=\/|$)/,
        replacement: resolve(rootDir, "AFFiNE/node_modules/yjs"),
      },
      {
        find: /^@preact\/signals-core(?=\/|$)/,
        replacement: resolve(rootDir, "node_modules/@preact/signals-core"),
      },
      // pdfmake is a transitive dep of @blocksuite/affine-shared (the PDF
      // adapter). It lives in AFFiNE/node_modules; alias it there so Cove can
      // reach the SAME singleton instance the adapter uses — letting us
      // re-point pdfMake.fonts at local fonts before PDF export (the adapter
      // otherwise hard-codes CORS-blocked cdn.affine.pro font URLs).
      {
        find: /^pdfmake(?=\/|$)/,
        replacement: resolve(rootDir, "AFFiNE/node_modules/pdfmake"),
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
      // Allow Vite to serve BlockSuite source from the sibling AFFiNE repo.
      allow: [rootDir, resolve(rootDir, "AFFiNE")],
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules") || id.includes("Affine")) {
            if (
              id.includes("@blocksuite") ||
              id.includes("Affine\\blocksuite") ||
              id.includes("Affine/blocksuite")
            )
              return "vendor-blocksuite";
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

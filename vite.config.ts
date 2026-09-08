import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    tailwindcss(),
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
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: resolve(rootDir, "src/$1"),
      },
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
      "@radix-ui/react-dismissable-layer",
      "@radix-ui/react-focus-scope",
      "@radix-ui/react-portal",
      "lit",
      "yjs",
    ],
  },
  optimizeDeps: {
    entries: ["index.html", "src/features/editor/blocksuite/**/*.{ts,tsx}"],
    // The whole vendored BlockSuite graph is served unbundled: esbuild's dep
    // cache only hashes lockfiles, so vendored-file patches (native-save
    // download hook, disabled caret auto-scroll) ship stale otherwise - and
    // excluding only patched packages splits the graph between prebundle and
    // source, double-registering custom elements (blank screen). One
    // resolution path for every vendored module keeps both patches live and
    // element registration singular.
    exclude: [
      "@vanilla-extract/css",
      "@vanilla-extract/private",
      "@blocksuite/affine",
      "@blocksuite/affine-block-attachment",
      "@blocksuite/affine-block-bookmark",
      "@blocksuite/affine-block-callout",
      "@blocksuite/affine-block-code",
      "@blocksuite/affine-block-data-view",
      "@blocksuite/affine-block-database",
      "@blocksuite/affine-block-divider",
      "@blocksuite/affine-block-edgeless-text",
      "@blocksuite/affine-block-embed",
      "@blocksuite/affine-block-embed-doc",
      "@blocksuite/affine-block-frame",
      "@blocksuite/affine-block-image",
      "@blocksuite/affine-block-latex",
      "@blocksuite/affine-block-list",
      "@blocksuite/affine-block-note",
      "@blocksuite/affine-block-paragraph",
      "@blocksuite/affine-block-root",
      "@blocksuite/affine-block-surface",
      "@blocksuite/affine-block-surface-ref",
      "@blocksuite/affine-block-table",
      "@blocksuite/affine-components",
      "@blocksuite/affine-ext-loader",
      "@blocksuite/affine-foundation",
      "@blocksuite/affine-fragment-adapter-panel",
      "@blocksuite/affine-fragment-doc-title",
      "@blocksuite/affine-fragment-frame-panel",
      "@blocksuite/affine-fragment-outline",
      "@blocksuite/affine-gfx-brush",
      "@blocksuite/affine-gfx-connector",
      "@blocksuite/affine-gfx-group",
      "@blocksuite/affine-gfx-link",
      "@blocksuite/affine-gfx-mindmap",
      "@blocksuite/affine-gfx-note",
      "@blocksuite/affine-gfx-pointer",
      "@blocksuite/affine-gfx-shape",
      "@blocksuite/affine-gfx-template",
      "@blocksuite/affine-gfx-text",
      "@blocksuite/affine-gfx-turbo-renderer",
      "@blocksuite/affine-inline-comment",
      "@blocksuite/affine-inline-footnote",
      "@blocksuite/affine-inline-latex",
      "@blocksuite/affine-inline-link",
      "@blocksuite/affine-inline-mention",
      "@blocksuite/affine-inline-preset",
      "@blocksuite/affine-inline-reference",
      "@blocksuite/affine-model",
      "@blocksuite/affine-rich-text",
      "@blocksuite/affine-shared",
      "@blocksuite/affine-widget-drag-handle",
      "@blocksuite/affine-widget-edgeless-auto-connect",
      "@blocksuite/affine-widget-edgeless-dragging-area",
      "@blocksuite/affine-widget-edgeless-selected-rect",
      "@blocksuite/affine-widget-edgeless-toolbar",
      "@blocksuite/affine-widget-edgeless-zoom-toolbar",
      "@blocksuite/affine-widget-frame-title",
      "@blocksuite/affine-widget-keyboard-toolbar",
      "@blocksuite/affine-widget-linked-doc",
      "@blocksuite/affine-widget-note-slicer",
      "@blocksuite/affine-widget-page-dragging-area",
      "@blocksuite/affine-widget-remote-selection",
      "@blocksuite/affine-widget-scroll-anchoring",
      "@blocksuite/affine-widget-slash-menu",
      "@blocksuite/affine-widget-toolbar",
      "@blocksuite/affine-widget-viewport-overlay",
      "@blocksuite/bs-docs",
      "@blocksuite/data-view",
      "@blocksuite/docs",
      "@blocksuite/global",
      "@blocksuite/integration-test",
      "@blocksuite/playground",
      "@blocksuite/std",
      "@blocksuite/store",
      "@blocksuite/sync",
      "@affine/templates",
    ],
  },
  server: {
    port: 1420,
    strictPort: true,
    fs: {
      allow: [rootDir],
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const p = id.replace(/\\/g, "/");
          if (p.includes("vendor/@blocksuite") || p.includes("node_modules/@blocksuite")) {
            return "vendor-blocksuite";
          }
          if (p.includes("vendor/@affine") || p.includes("@affine/templates")) {
            return "vendor-templates";
          }
          if (p.includes("node_modules")) {
            // yjs/lib0/y-protocols/signals-core are BlockSuite's CRDT runtime;
            // they reference each other through import cycles, so splitting
            // them from @blocksuite tears a cycle across a chunk boundary and
            // crashes module init (TDZ ReferenceError) in release builds.
            if (
              p.includes("node_modules/yjs") ||
              p.includes("node_modules/lib0") ||
              p.includes("node_modules/y-protocols") ||
              p.includes("node_modules/@preact/signals-core")
            ) {
              return "vendor-blocksuite";
            }
            if (p.includes("@radix-ui") || p.includes("cmdk")) return "vendor-ui-primitives";
            if (p.includes("lucide-react") || p.includes("framer-motion"))
              return "vendor-icons-animation";
            if (p.includes("/react/") || p.includes("/react-dom/") || p.includes("/scheduler/"))
              return "vendor-react";
            if (p.includes("pdfmake") || p.includes("html2canvas") || p.includes("jspdf"))
              return "vendor-export";
          }
        },
      },
    },
  },
});

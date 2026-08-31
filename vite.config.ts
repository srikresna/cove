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
    exclude: ["@vanilla-extract/css", "@vanilla-extract/private"],
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
            if (p.includes("yjs")) return "vendor-yjs";
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

import { transform } from "esbuild";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type Plugin } from "vite";
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
  optimizeDeps: {
    entries: ["index.html", "src/components/editor/blocksuite/**/*.{ts,tsx}"],
    exclude: ["@vanilla-extract/css", "@vanilla-extract/private"],
  },
  server: {
    port: 1420,
    strictPort: true,
    fs: {
      // Allow Vite to serve BlockSuite source from the sibling AFFiNE repo.
      allow: [rootDir, resolve(rootDir, "Affine")],
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
            if (id.includes("@radix-ui") || id.includes("cmdk"))
              return "vendor-ui-primitives";
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

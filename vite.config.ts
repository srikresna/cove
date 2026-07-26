import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { transform } from "esbuild";
import { visualizer } from "rollup-plugin-visualizer";
import { type Plugin, defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

// BlockSuite's package exports point at raw .ts sources, which Rollup cannot
// parse. Redirect every @blocksuite import to the compiled dist JS instead
// (tsconfig paths do the same for type checking).
function blocksuiteDist(): Plugin {
  return {
    name: "cove:blocksuite-dist",
    enforce: "pre",
    resolveId(source) {
      const match = /^@blocksuite\/([^/]+)(?:\/(.+))?$/.exec(source);
      if (!match) return null;
      const [, pkg, sub] = match;
      const base = resolve(rootDir, "node_modules", "@blocksuite", pkg, "dist");
      const candidates = sub
        ? [resolve(base, `${sub}.js`), resolve(base, sub, "index.js"), resolve(base, sub)]
        : [resolve(base, "index.js")];
      for (const candidate of candidates) {
        if (candidate.endsWith(".js") && existsSync(candidate)) {
          return candidate;
        }
      }
      return null;
    },
    // Their dist keeps `accessor` fields (decorators proposal), which Rollup's
    // parser rejects — lower them to es2022 before Rollup sees the code.
    async transform(code, id) {
      if (!id.includes("@blocksuite") || !id.endsWith(".js")) return null;
      if (!code.includes("accessor")) return null;
      const result = await transform(code, { loader: "js", target: "es2022" });
      return { code: result.code, map: result.map || null };
    },
  };
}

export default defineConfig({
  plugins: [
    blocksuiteDist(),
    react(),
    // Bundle analysis is opt-in (ANALYZE=1 bun run build) so routine builds
    // don't regenerate a 2MB stats.html in the repo root.
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
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@blocksuite")) {
              return "vendor-blocksuite";
            }
            if (id.includes("node_modules/yjs/")) {
              return "vendor-yjs";
            }
            if (id.includes("@radix-ui") || id.includes("cmdk")) {
              return "vendor-ui-primitives";
            }
            if (id.includes("lucide-react") || id.includes("framer-motion")) {
              return "vendor-icons-animation";
            }
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")
            ) {
              return "vendor-react";
            }
          }
        },
      },
    },
  },
});

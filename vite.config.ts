import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
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
            // NOTE: @blocknote / @mantine are intentionally NOT assigned a manual
            // chunk. They are imported only by the React.lazy()-loaded editor, so
            // Vite/Rollup must be free to place them in the editor's dynamic-import
            // (lazy) chunk. Forcing them into a named chunk made it a shared/eager
            // chunk that Vite preloaded at startup, defeating the lazy boundary.
          }
        },
      },
    },
  },
});

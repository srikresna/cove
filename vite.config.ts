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
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui") || id.includes("cmdk")) {
              return "vendor-ui-primitives";
            }
            if (id.includes("@blocknote") || id.includes("@mantine")) {
              return "vendor-blocknote";
            }
            if (id.includes("lucide-react") || id.includes("framer-motion")) {
              return "vendor-icons-animation";
            }
          }
        },
      },
    },
  },
});

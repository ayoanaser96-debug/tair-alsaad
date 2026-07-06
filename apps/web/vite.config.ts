import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tayralsaad/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@tayralsaad/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts"),
      "@tayralsaad/i18n": path.resolve(__dirname, "../../packages/i18n/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Route-level React.lazy already isolates page bundles (admin, charts, dev, MSW).
    // The remaining entry chunk is the shared core (React, Router, Query, i18n, axios,
    // socket.io) loaded on every page; bump the warning ceiling to reflect that.
    chunkSizeWarningLimit: 700,
  },
});

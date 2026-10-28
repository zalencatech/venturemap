import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js and Recharts are large libraries; put them in their own files so they cache well.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber"],
          charts: ["recharts"],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});

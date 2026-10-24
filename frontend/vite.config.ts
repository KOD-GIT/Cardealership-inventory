/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // CarCanvas (three.js) is a deliberate lazy chunk loaded only on first hover, so >500 kB is expected.
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"], // only our source (not dist/ or config files)
      // CarCanvas needs a real WebGL context (checked manually in a browser); main.tsx is the entry point.
      exclude: ["src/main.tsx", "src/components/vehicle3d/CarCanvas.tsx", "src/test/**", "src/**/*.test.*", "src/vite-env.d.ts"],
    },
  },
});

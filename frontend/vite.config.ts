/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"], // only our source (not dist/ or config files)
      exclude: ["src/main.tsx", "src/test/**", "src/**/*.test.*", "src/vite-env.d.ts"],
    },
  },
});

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome74"],
    lib: {
      entry: "src/index.ts",
      name: "virtualScroll",
      formats: ["iife"],
    },
    emptyOutDir: false,
  },
});

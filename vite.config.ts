import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome74"],
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: /^lit-element/,
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ["./"],
    },
  },
});

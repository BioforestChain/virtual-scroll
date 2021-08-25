import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome74"],
    lib: {
      entry: "src/index.ts",
      name: "virtualScroll",
      formats: ["es", "cjs", "umd"],
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

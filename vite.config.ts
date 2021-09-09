import { defineConfig } from "vite";
import minifyHTML from "rollup-plugin-minify-html-literals";

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
      plugins: [minifyHTML],
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ["./"],
    },
  },
});

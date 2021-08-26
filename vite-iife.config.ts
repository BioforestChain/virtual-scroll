import { defineConfig } from "vite";
import minifyHTML from "rollup-plugin-minify-html-literals";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome74"],
    lib: {
      entry: "src/index.ts",
      name: "virtualScroll",
      formats: ["iife"],
    },
    rollupOptions: {
      plugins: [minifyHTML.default()],
    },
    emptyOutDir: false,
  },
});

import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome74"],
    rollupOptions: {
      external: [resolve(__dirname, "main.ts")],
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    outDir: "docs",
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasmPack from "vite-plugin-wasm-pack";

// https://vitejs.dev/config/
export default defineConfig({
  // Workaround for hosting on GitHub Pages.
  // See: https://dev.to/shashannkbawa/deploying-vite-app-to-github-pages-3ane
  base: "/elara/",
  root: "web",
  plugins: [react(), wasmPack("./elara-lib")],
});

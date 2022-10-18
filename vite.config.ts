import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasmPack from "vite-plugin-wasm-pack";

// https://vitejs.dev/config/
export default defineConfig({
  root: "web",
  plugins: [react(), wasmPack("./battle-game-lib")],
  // resolve: { alias: { vue: "vue/dist/vue.esm-bundler.js" } },
  // server: {
  //   watch: {
  //     ignored: ["!**/node_modules/battle-game-lib/**"],
  //   },
  // },
  // optimizeDeps: {
  //   exclude: ["battle-game-lib"],
  // },
});

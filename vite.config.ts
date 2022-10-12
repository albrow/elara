import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import wasmPack from "vite-plugin-wasm-pack";

// https://vitejs.dev/config/
export default defineConfig({
  root: "web",
  plugins: [vue(), wasmPack("./battle-game-lib")],
  // server: {
  //   watch: {
  //     ignored: ["!**/node_modules/battle-game-lib/**"],
  //   },
  // },
  // optimizeDeps: {
  //   exclude: ["battle-game-lib"],
  // },
});

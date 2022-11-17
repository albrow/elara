import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasmPack from "vite-plugin-wasm-pack";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // Use async import as a workaround for using mdx.
  // See: https://github.com/brillout/vite-plugin-mdx/issues/44
  // @ts-ignore
  const mdx = await import("@mdx-js/rollup");
  // Set base="/elara/" as a workaround for hosting on GitHub Pages.
  // See: https://dev.to/shashannkbawa/deploying-vite-app-to-github-pages-3ane
  return {
    base: "/elara/",
    root: "web",
    plugins: [react(), wasmPack("./elara-lib"), mdx.default()],
  };
});

// This config file includes some customizations for Electron builds.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasmPack from "vite-plugin-wasm-pack";

export default defineConfig(async () => {
  const mdx = await import("@mdx-js/rollup");
  // @ts-ignore
  const remarkGfm = await import("remark-gfm");
  return {
    // Set base="" for Electron. This causes all assets to use relative paths,
    // which is required for the Electron build to work.
    base: "",
    root: "web",
    build: {
      emptyOutDir: true,
      outDir: "../electron/static",
    },
    plugins: [
      wasmPack("./elara-lib"),
      react(),
      mdx.default({ remarkPlugins: [remarkGfm.default as any] }),
    ],
    define: {
      "import.meta.vitest": "undefined",
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      ELARA_BUILD_TARGET: JSON.stringify("electron"),
    },
  };
});

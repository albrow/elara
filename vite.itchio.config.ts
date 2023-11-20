// This config file includes some customizations for hosting on itch.io.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasmPack from "vite-plugin-wasm-pack";

export default defineConfig(async () => {
  const mdx = await import("@mdx-js/rollup");
  // @ts-ignore
  const remarkGfm = await import("remark-gfm");
  return {
    // Set base="" for itch.io. This causes all assets to use relative paths,
    // which is required. See https://itch.io/docs/creators/html5
    base: "",
    root: "web",
    build: {
      outDir: `dist-itchio-${process.env.npm_package_version}`,
    },
    plugins: [
      wasmPack("./elara-lib"),
      react(),
      mdx.default({ remarkPlugins: [remarkGfm.default as any] }),
    ],
    define: {
      "import.meta.vitest": "undefined",
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      ELARA_BUILD_TARGET: JSON.stringify("itchio"),
    },
  };
});

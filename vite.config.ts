import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasmPack from "vite-plugin-wasm-pack";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // Use async import as a workaround for using mdx.
  // See: https://github.com/brillout/vite-plugin-mdx/issues/44
  // @ts-ignore
  const mdx = await import("@mdx-js/rollup");
  // @ts-ignore
  const remarkGfm = await import("remark-gfm");
  return {
    // Chokidar options to try and work around an error
    // that can occur when Vite tries to rebuild TypeScript files
    // while Rust/wasmpack is still compiling.
    server: {
      watch: {
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      },
      host: "127.0.0.1"
    },
    // Set base="/elara/" as a workaround for hosting on GitHub Pages.
    // See: https://dev.to/shashannkbawa/deploying-vite-app-to-github-pages-3ane
    // base: "/elara/",
    root: "web",
    plugins: [
      wasmPack("./elara-lib"),
      react(),
      mdx.default({ remarkPlugins: [remarkGfm.default as any] }),
    ],
    // Disable/remove in-source tests for production builds.
    // See: https://vitest.dev/guide/in-source.html#production-build
    define: {
      "import.meta.vitest": "undefined",
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      ELARA_BUILD_TARGET: JSON.stringify("web"),
    },
  };
});

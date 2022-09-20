// Copied from https://github.com/evanw/esbuild/issues/408#issuecomment-757555771
let wasmPlugin = {
  name: "wasm",
  setup(build) {
    let path = require("path");
    let fs = require("fs");

    // Resolve ".wasm" files to a path with a namespace
    build.onResolve({ filter: /\.wasm$/ }, (args) => {
      if (args.resolveDir === "") {
        return; // Ignore unresolvable paths
      }
      return {
        path: path.isAbsolute(args.path)
          ? args.path
          : path.join(args.resolveDir, args.path),
        namespace: "wasm-binary",
      };
    });

    // Virtual modules in the "wasm-binary" namespace contain the
    // actual bytes of the WebAssembly file. This uses esbuild's
    // built-in "binary" loader instead of manually embedding the
    // binary data inside JavaScript code ourselves.
    build.onLoad({ filter: /.*/, namespace: "wasm-binary" }, async (args) => ({
      contents: await fs.promises.readFile(args.path),
      loader: "binary",
    }));
  },
};

require("esbuild")
  .build({
    entryPoints: ["ts/index.ts"],
    bundle: true,
    outfile: "www/main.js",
    plugins: [wasmPlugin],
  })
  .catch(() => process.exit(1));

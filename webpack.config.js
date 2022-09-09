const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  mode: "development",
  entry: "./ts/bootstrap.ts",
  output: {
    path: dist,
    filename: "[name].js",
  },
  devServer: {
    allowedHosts: ["localhost", "locohost"],
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    watchFiles: ["./static/index.html"],
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "static"),
          to: dist,
        },
      ],
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        include: [path.resolve(__dirname, "ts")],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".json", ".tsx", ".wasm", ".mjs"],
  },
};

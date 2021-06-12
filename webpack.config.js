/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const tsNameof = require("ts-nameof");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");

/** @type {import("webpack").Configuration} */
const Default = {
  context: __dirname,
  entry: ["./src/client.ts", "webpack-plugin-serve/client"],
  target: "node",
  resolve: {
    extensions: [".js", ".ts", ".json"],
  },
  externals: [nodeExternals()],
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "dist"),
    chunkFilename: "[name].js",
    filename: "[name].js",
    assetModuleFilename: "resources/[name][ext]",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            getCustomTransformers: () => ({ before: [tsNameof] }),
          },
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new WebpackPluginServe({
      hmr: true,
      port: 9000,
    }),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: "./src/**/*.ts",
      },
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: ["package.json"],
    }),
  ],
};

module.exports = Default;

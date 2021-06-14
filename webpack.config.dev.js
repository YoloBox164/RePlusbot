/* eslint-disable @typescript-eslint/no-var-requires */
const WebpackDefaultConfig = require("./webpack.config");
const { WebpackPluginServe } = require("webpack-plugin-serve");

/** @type {import("webpack").Configuration} */
const Development = {
  ...WebpackDefaultConfig,
  mode: "development",
  watch: true,
  plugins: [
    ...WebpackDefaultConfig.plugins,
    new WebpackPluginServe({
      hmr: true,
      port: 9000,
    }),
  ],
};

module.exports = Development;

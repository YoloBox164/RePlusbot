/* eslint-disable @typescript-eslint/no-var-requires */
const WebpackDefaultConfig = require("./webpack.config");

/** @type {import("webpack").Configuration} */
const Development = {
  ...WebpackDefaultConfig,
  mode: "development",
  watch: true,
};

module.exports = Development;

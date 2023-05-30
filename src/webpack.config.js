const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    fallback: {
      zlib: require.resolve("browserify-zlib"),
    },
  },
};

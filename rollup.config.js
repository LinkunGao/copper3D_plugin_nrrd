import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "./src/index.js",
  output: [
    {
      file: "dist/main.umd.js",
      format: "umd",
      name: "bundle-name",
    },
    {
      file: "dist/main.esm.js",
      format: "esm",
    },
    {
      file: "dist/main.cjs.js",
      format: "cjs",
    },
  ],

  plugins: [resolve(), commonjs()],
};

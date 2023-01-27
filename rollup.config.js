import terser from "@rollup/plugin-terser";
const pkg = require("./package.json");

export default {
  input: "src/main.js",
  plugins: [terser()],
  output: [
    {
      name: "copper3D_nrrd_plugin",
      file: pkg.browser,
      format: "umd",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
};
// import commonjs from "@rollup/plugin-commonjs";
// import resolve from "@rollup/plugin-node-resolve";

// export default {
//   input: "./src/index.js",
//   output: [
//     {
//       file: "dist/main.umd.js",
//       format: "umd",
//       name: "Copper_Nrrd",
//     },
//     {
//       file: "dist/main.esm.js",
//       format: "esm",
//     },
//     {
//       file: "dist/main.cjs.js",
//       format: "cjs",
//     },
//   ],

//   plugins: [resolve(), commonjs()],
// };

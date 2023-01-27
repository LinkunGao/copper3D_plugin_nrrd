import babel from "@rollup/plugin-babel";

export default {
  input: "./src/main.js",

  output: [
    {
      name: "copper3D_nrrd_plugin",
      file: "dist/bundle.js",
      format: "umd",
    },
  ],
  plugins: [
    babel({
      babelHelpers: "bundled",
      presets: [["@babel/preset-env", { modules: false }]],
    }),
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

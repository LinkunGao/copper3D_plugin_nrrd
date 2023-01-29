var babel = require("@rollup/plugin-babel");
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";
require("dotenv").config({ path: "./.env" });

export default {
  input: "./src/main.js",

  output: [
    {
      name: "copper3D_nrrd_plugin",
      file: "dist/bundle.js",
      format: "umd",
    },
    {
      file: "dist/bundle.esm.mjs",
      format: "es",
    },
  ],
  sourceMap: "inline",
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      presets: [["@babel/preset-env", { modules: false }]],
      exclude: "node_modules/**",
    }),
    process.env.NODE_ENV === "production" && uglify(),
  ],
};

// 在打包时，若存在引用第三方包， 则必须要使用rollup-plugin-node-resolve和rollup-plugin-commonjs来解决，第三方的引入。
// presets: [["@babel/preset-env",{ modules: false }]]
// rollup-plugin-uglify 用于美化压缩代码

// v2
// var babel = require("@rollup/plugin-babel");

// export default {
//   input: "./src/main.js",

//   output: [
//     {
//       name: "copper3D_nrrd_plugin",
//       file: "dist/bundle.js",
//       format: "umd",
//     },
//     {
//       file: "dist/bundle.esm.mjs",
//       format: "es",
//     },
//   ],
//   sourceMap: "inline",
//   plugins: [

//     babel({
//       babelHelpers: "bundled",
//       presets: [["@babel/preset-env",{ modules: false }]],
//     }),

//   ],
// };

import babel from "@rollup/plugin-babel";

export default {
  input: "./src/index.js", // 入口文件
  output: [
    {
      file: "dist/main.umd.js",
      format: "umd",
      name: "Copper_Nrrd",
    },
    {
      file: "./dist/main.esm.js",
      format: "esm", // 将软件包保存为 ES 模块文件
      name: "Copper_Nrrd_Plugin",
    },
    {
      file: "./dist/main.cjs.js",
      format: "cjs", // CommonJS，适用于 Node 和 Browserify/Webpack
      name: "Copper_Nrrd_Plugin",
      exports: "default",
    },
  ],
  watch: {
    // 配置监听处理
    exclude: "node_modules/**",
  },
  plugins: [
    // 使用插件 @rollup/plugin-babel
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
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

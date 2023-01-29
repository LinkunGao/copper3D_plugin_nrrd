const path = require("path");
module.exports = {
  // 模式
  mode: "development", // 也可以使用 production
  // 入口
  entry: "./src/main.js",
  // 出口
  output: {
    // 打包文件夹
    path: path.resolve(__dirname, "dist"),
    // 打包文件
    filename: "bundle.js",
    // 向外暴露的对象的名称
    library: "copper3D_nrrd_plugin",
    // 打包生成库可以通过esm/commonjs/reqirejs的语法引入
    libraryTarget: "umd",
    // libraryExport: "default", // 增加这个属性只能用于 esm module的加载，而不能用于umd的加载
  },
};

// npm i webpack webpack-cli -D

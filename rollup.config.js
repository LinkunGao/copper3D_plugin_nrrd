var babel = require("@rollup/plugin-babel");

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

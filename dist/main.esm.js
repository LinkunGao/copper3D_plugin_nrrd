var addition = function addition(a, b) {
  return a + b;
};

// import { NRRDLoader } from "./NRRDLoader.js";
var version = "0.0.1";
var index = {
  version: version,
  addition: addition
};
// export default NRRDLoader;
// export ;

// "main": "/src/index.js",

// "main": "dist/main.umd.js",
//   "moudle": "dist/main.esm.js",

export { index as default };

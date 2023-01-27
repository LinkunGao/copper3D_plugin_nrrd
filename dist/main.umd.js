(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.copper3D_nrrd_plugin = {}));
})(this, (function (exports) { 'use strict';

  const addition = (a, b) => {
    return a + b;
  };

  // import { NRRDLoader } from "./NRRDLoader.js";

  const version = "0.0.1";
  // export default NRRDLoader;
  // export ;

  // "main": "/src/index.js",

  // "main": "dist/main.umd.js",
  //   "moudle": "dist/main.esm.js",

  exports.addition = addition;
  exports.default = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

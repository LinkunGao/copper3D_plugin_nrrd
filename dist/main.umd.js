(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Copper_Nrrd = factory());
})(this, (function () { 'use strict';

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

  return index;

}));

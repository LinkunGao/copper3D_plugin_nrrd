(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Copper_Nrrd = {}));
})(this, (function (exports) { 'use strict';

	// import { NRRDLoader } from "./NRRDLoader.js";

	var version = "0.0.1";

	// export default NRRDLoader;
	// export ;

	// "main": "/src/index.js",

	// "main": "dist/main.umd.js",
	//   "moudle": "dist/main.esm.js",

	exports.version = version;

}));

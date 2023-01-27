import { NRRDLoader } from "./NRRDLoader.js";
import addition from "./add.js";

export function test() {
  document.write("测试自定义包");
  console.log("test()");
  console.log("nimashishabi");
}

export { addition };
export default NRRDLoader;

// "main": "/src/index.js",

// "main": "dist/main.umd.js",
//   "moudle": "dist/main.esm.js",

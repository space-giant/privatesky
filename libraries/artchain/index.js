if (typeof $$ !== "undefined" && typeof $$.blockchain === "undefined") {
  const pskDB = require("pskdb");
  $$.blockchain = pskDB.startDB("./database");
}

// const path = require("path");

// let prefix = "..";

// //temporary fix
// //cwd and point of reference is different when loaded in domain vs agent
// if (process.cwd().indexOf("engine") === -1) {
//   prefix = "code";
// }

$$.loadLibrary("artchain", require("./main"));

if (typeof $$ !== "undefined" && typeof $$.blockchain === "undefined") {
  const fs = require("fs");
  const blockchainDir = "./database";

  fs.mkdirSync(blockchainDir);

  const blockchain = require("blockchain");
  const worldStateCache = blockchain.createWorldStateCache("fs", blockchainDir);
  const historyStorage = blockchain.createHistoryStorage("fs", blockchainDir);
  const consensusAlgorithm = blockchain.createConsensusAlgorithm("direct");
  const signatureProvider = blockchain.createSignatureProvider("permissive");

  $$.blockchain = blockchain.createABlockchain(
    worldStateCache,
    historyStorage,
    consensusAlgorithm,
    signatureProvider,
    false
  );
}

// const path = require("path");

// let prefix = "..";

// //temporary fix
// //cwd and point of reference is different when loaded in domain vs agent
// if (process.cwd().indexOf("engine") === -1) {
//   prefix = "code";
// }

$$.loadLibrary("artchain", require("./main"));

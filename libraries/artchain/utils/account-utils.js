const crypto = require("crypto");

function getAccountAlias(owner, token) {
  return crypto
    .createHash("md5")
    .update(`${owner}_${token}`, "utf8")
    .digest("hex");
}

function getAccount(transaction, owner, token) {
  let accountAlias = getAccountAlias(owner, token);
  let account = transaction.lookup("artchain.Account", accountAlias);
  return account;
}

module.exports = {
  getAccountAlias,
  getAccount
};

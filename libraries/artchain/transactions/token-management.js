const { getAccount, getAccountAlias } = require("../utils/account-utils");

$$.transaction.describe("TokenManagement", {
  emit: function(name, symbol, supply, owner) {
    let transaction = $$.blockchain.beginTransaction({});

    let token = $$.uidGenerator.safe_uuid();
    let newToken = transaction.lookup("artchain.Token", token);

    if (!newToken.init(token, name, symbol, owner)) return this.return(`Token ${token} already exists!`);
    if (!newToken.emit(supply)) return this.return("Token cannot be emitted!");

    let alias = getAccountAlias(owner, token);
    let account = getAccount(transaction, owner, token);

    if (!account.init(alias, token, owner)) {
      return this.return(`Owner ${owner} already has an account for token ${token}!`);
    }

    account.receive(supply);

    try {
      transaction.add(newToken);
      transaction.add(account);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Token issue commit failed! ${err ? err.message : ""}`);
    }

    this.return(null, token);
  }
});

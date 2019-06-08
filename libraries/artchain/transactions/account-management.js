const { getAccount, getAccountAlias } = require("../utils/account-utils");

$$.transaction.describe("AccountManagement", {
  create: function(owner, token) {
    let transaction = $$.blockchain.beginTransaction({});

    let alias = getAccountAlias(owner, token);
    let account = getAccount(transaction, owner, token);

    if (!account.init(alias, token, owner)) {
      return this.return(`Owner ${owner} already has an account for token ${token}!`);
    }

    try {
      transaction.add(account);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Account creation failed for owner ${owner} and token ${token}! ${err ? err.message : ""}`);
    }

    this.return(null, account);
  },

  close: function(owner, token) {
    let transaction = $$.blockchain.beginTransaction({});

    let account = getAccount(transaction, owner, token);

    if (!account.isValid()) return this.return("Invalid account!");
    if (!account.isActive()) return this.return("Account is not active!");

    let balance = account.getBalance();
    if (balance > 0) return this.return(`Account balance is non zero (${balance})!`);

    if (!account.close()) return this.return("Account closing procedure failed!");

    try {
      transaction.add(account);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Account closing procedure failed! ${err ? err.message : ""}`);
    }

    this.return(null, account.uid);
  },

  transfer: function(source, target, token, amount) {
    let transaction = $$.blockchain.beginTransaction({});

    let sourceAccount = getAccount(transaction, source, token);
    if (sourceAccount.getToken() !== token || !sourceAccount.transfer(amount)) {
      return this.return("Source transfer failed!");
    }

    let targetAccount = getAccount(transaction, target, token);
    if (targetAccount.getToken() !== token || !targetAccount.receive(amount)) {
      return this.return("Target transfer failed!");
    }

    try {
      transaction.add(sourceAccount);
      transaction.add(targetAccount);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Transfer failed! ${err ? err.message : ""}`);
    }

    // temp fix; must clarify
    let uid = $$.uidGenerator.safe_uuid();

    this.return(null, uid);
  },

  balanceOf: function(owner, token) {
    let transaction = $$.blockchain.beginTransaction({});
    let account = getAccount(transaction, owner, token);

    if (!account.isValid()) return this.return("Invalid account");
    if (!account.isActive()) return this.return("Account is not active.");

    this.return(null, account.balance());
  }
});

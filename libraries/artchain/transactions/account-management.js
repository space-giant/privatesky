$$.transaction.describe("AccountManagement", {
  create: function(symbol, owner) {
    let transaction = $$.blockchain.beginTransaction({});
    let uid = $$.uidGenerator.safe_uuid();
    let account = transaction.lookup("artchain.Account", uid);

    account.init(uid, symbol, owner);

    try {
      transaction.add(account);
      $$.blockchain.commit(transaction);
    } catch (err) {
      this.return("Account creation failed!");
      return;
    }
    this.return(null, uid);
  },
  close: function(accountId) {
    let transaction = $$.blockchain.beginTransaction({});

    let account = transaction.lookup("artchain.Account", accountId);

    if (!account.valid()) {
      this.return("Invalid account");
      return;
    }

    if (!account.active()) {
      this.return("Account is not active.");
      return;
    }

    if (account.balance() > 0) {
      this.return("Account balance to high.");
      return;
    }

    if (!account.close()) {
      this.return("Account closing procedure failed.");
      return;
    }

    try {
      transaction.add(account);
      $$.blockchain.commit(transaction);
    } catch (err) {
      this.return("Account closing procedure failed.");
      return;
    }

    this.return(null, accountId);
  },
  transfer: function(tokens, symbol, from, to) {
    let transaction = $$.blockchain.beginTransaction({});

    let sourceAccount = transaction.lookup("artchain.Account", from);
    if (sourceAccount.getSymbol() !== symbol || !sourceAccount.transfer(tokens)) {
      this.return("Transfer failed!");
      return;
    }

    let targetAccount = transaction.lookup("artchain.Account", to);
    if (targetAccount.getSymbol() !== symbol || !targetAccount.receive(tokens)) {
      this.return("Transfer failed");
      return;
    }

    try {
      transaction.add(sourceAccount);
      transaction.add(targetAccount);
      $$.blockchain.commit(transaction);
    } catch (err) {
      this.return("Transfer failed!");
      return;
    }

    // temp fix; must clarify
    let uid = $$.uidGenerator.safe_uuid();

    this.return(null, uid);
  },
  balanceOf: function(accountId) {
    let transaction = $$.blockchain.beginTransaction({});
    let account = transaction.lookup("artchain.Account", accountId);

    if (!account.valid()) {
      this.return("Invalid account");
      return;
    }

    if (!account.active()) {
      this.return("Account is not active.");
      return;
    }

    this.return(null, account.balance());
  }
});

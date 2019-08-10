$$.transaction.describe("WalletManagement", {
  create: function(owner, token) {
    let transaction = $$.blockchain.beginTransaction({});

    let account = transaction.lookup("artchain.Account", owner);
    account.init(); // ensure that the account is created

    if (account.isTokenPresent(token)) {
      return this.return(`Owner ${owner} already has an wallet for token ${token}!`);
    }

    let walletAlias = $$.uidGenerator.safe_uuid();

    if (!account.addWallet(token, walletAlias)) {
      return this.return(`Owner ${owner} already has an wallet for token ${token}!`);
    }

    let wallet = transaction.lookup("artchain.Wallet", walletAlias);
    if (!wallet.init(walletAlias, token, owner)) {
      return this.return(
        `Owner ${owner} cannot create wallet for token ${token} because generated wallet address (${walletAlias}) is already in use!`
      );
    }

    try {
      transaction.add(account);
      transaction.add(wallet);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Wallet creation failed for owner ${owner} and token ${token}! ${err ? err.message : ""}`);
    }

    this.return(null, walletAlias);
  },

  close: function(walletAlias) {
    let transaction = $$.blockchain.beginTransaction({});

    let wallet = transaction.lookup("artchain.Wallet", walletAlias);

    if (!wallet.isValid()) return this.return("Invalid wallet!");
    if (!wallet.isActive()) return this.return("Wallet is not active!");

    let balance = wallet.getBalance();
    if (balance > 0) return this.return(`Wallet balance is non zero (${balance})!`);

    if (!wallet.close()) return this.return("Wallet closing procedure failed!");

    try {
      transaction.add(wallet);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Wallet closing procedure failed! ${err ? err.message : ""}`);
    }

    this.return(null, walletAlias);
  },

  transfer: function(sourceWalletAlias, targetWalletAlias, token, amount) {
    let transaction = $$.blockchain.beginTransaction({});

    let sourceWallet = transaction.lookup("artchain.Wallet", sourceWalletAlias);
    if (sourceWallet.getToken() !== token || !sourceWallet.transfer(amount)) {
      return this.return("Source transfer failed!");
    }

    let targetWallet = transaction.lookup("artchain.Wallet", targetWalletAlias);
    if (targetWallet.getToken() !== token || !targetWallet.receive(amount)) {
      return this.return("Target transfer failed!");
    }

    try {
      transaction.add(sourceWallet);
      transaction.add(targetWallet);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Transfer failed! ${err ? err.message : ""}`);
    }

    // temp fix; must clarify
    let uid = $$.uidGenerator.safe_uuid();

    this.return(null, uid);
  },

  balanceOf: function(walletAlias) {
    let transaction = $$.blockchain.beginTransaction({});
    let wallet = transaction.lookup("artchain.Wallet", walletAlias);

    if (!wallet.isValid()) return this.return("Invalid wallet");
    if (!wallet.isActive()) return this.return("Wallet is not active.");

    try {
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`balanceOf failed! ${err ? err.message : ""}`);
    }

    this.return(null, wallet.balance());
  }
});

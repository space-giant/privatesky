$$.transaction.describe("TokenManagement", {
  emit: function(name, symbol, supply, owner) {
    let transaction = $$.blockchain.beginTransaction({});

    let token = $$.uidGenerator.safe_uuid();
    let newToken = transaction.lookup("artchain.Token", token);

    if (!newToken.init(token, name, symbol, owner)) return this.return(`Token ${token} already exists!`);
    if (!newToken.emit(supply)) return this.return("Token cannot be emitted!");

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

    wallet.receive(supply);

    try {
      transaction.add(newToken);
      transaction.add(account);
      transaction.add(wallet);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Token issue commit failed! ${err ? err.message : ""}`);
    }

    this.return(null, {
      token,
      wallet: walletAlias
    });
  }
});

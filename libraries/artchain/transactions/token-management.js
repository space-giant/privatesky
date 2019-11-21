$$.transaction.describe("TokenManagement", {
  emit: function(name, symbol, supply, owner) {
    let token = $$.uidGenerator.safe_uuid();
    let newToken = this.transaction.lookup("artchain.Token", token);

    if (!newToken.init(token, name, symbol, owner)) return this.return(`Token ${token} already exists!`);
    if (!newToken.emit(supply)) return this.return("Token cannot be emitted!");

    let account = this.transaction.lookup("artchain.Account", owner);
    account.init(); // ensure that the account is created

    if (account.isTokenPresent(token)) {
      return this.return(`Owner ${owner} already has an wallet for token ${token}!`);
    }

    let walletAlias = $$.uidGenerator.safe_uuid();

    if (!account.addWallet(token, walletAlias)) {
      return this.return(`Owner ${owner} already has an wallet for token ${token}!`);
    }

    let wallet = this.transaction.lookup("artchain.Wallet", walletAlias);
    if (!wallet.init(walletAlias, token, owner)) {
      return this.return(
        `Owner ${owner} cannot create wallet for token ${token} because generated wallet address (${walletAlias}) is already in use!`
      );
    }

    wallet.receive(supply);

    try {
      this.transaction.add(newToken);
      this.transaction.add(account);
      this.transaction.add(wallet);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Token issue commit failed! ${err ? err.message : ""}`);
    }

    this.return(null, {
      token,
      wallet: walletAlias
    });
  }
});

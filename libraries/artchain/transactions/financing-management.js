$$.transaction.describe("FinancingManagement", {
  create: function(beneficiary, financingInfo) {
    let transaction = $$.blockchain.beginTransaction({});

    let owner = $$.uidGenerator.safe_uuid();

    let financingAlias = $$.uidGenerator.safe_uuid();
    let financing = transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.init(financingAlias, owner, beneficiary, financingInfo)) {
      return this.return(
        `Financing ${financingAlias} cannot be created for beneficiar ${beneficiary} because financing exists already!`
      );
    }

    try {
      transaction.add(financing);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Financing creation failed for beneficiary ${beneficiary}! ${err ? err.message : ""}`);
    }

    this.return(null, {
      financing: financingAlias,
      owner
    });
  },

  approve: function(financingAlias) {
    let transaction = $$.blockchain.beginTransaction({});

    let financing = transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.approve()) {
      return this.return(
        `Financing ${financingAlias} cannot be approved because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      transaction.add(financing);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be approved! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  reject: function(financingAlias) {
    let transaction = $$.blockchain.beginTransaction({});

    let financing = transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.reject()) {
      return this.return(
        `Financing ${financingAlias} cannot be rejectd because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      transaction.add(financing);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be rejectd! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  apply: function(financingAlias) {
    let transaction = $$.blockchain.beginTransaction({});

    let financing = transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.apply()) {
      return this.return(
        `Financing ${financingAlias} cannot be applied because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      transaction.add(financing);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be applied! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  start: function(financingAlias, tokenInfo) {
    let transaction = $$.blockchain.beginTransaction({});

    let financing = transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.isValid()) {
      return this.return(`Financing ${financingAlias} is not valid!`);
    }

    if (!financing.canStart()) {
      return this.return(
        `Financing ${financingAlias} cannot be started because it has the following status: ${financing.getStatus()}!`
      );
    }

    let owner = financing.getOwner();

    let account = transaction.lookup("artchain.Account", owner);
    account.init(); // ensure that the account is created

    let token = $$.uidGenerator.safe_uuid();
    let newToken = transaction.lookup("artchain.Token", token);

    if (!newToken.init(token, tokenInfo.name, tokenInfo.symbol, owner))
      return this.return(`Token ${token} already exists!`);
    if (!newToken.emit(tokenInfo.supply)) return this.return("Token cannot be emitted!");

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

    wallet.receive(tokenInfo.supply);

    financing.setToken(token);
    financing.start();

    try {
      transaction.add(financing);
      transaction.add(account);
      transaction.add(newToken);
      transaction.add(wallet);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be started! ${err ? err.message : ""}`);
    }

    this.return(null, {
      financing: financingAlias,
      token,
      wallet: walletAlias
    });
  },

  stop: function(financingAlias) {
    let transaction = $$.blockchain.beginTransaction({});

    let financing = transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.stop()) {
      return this.return(
        `Financing ${financingAlias} cannot be stoped because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      transaction.add(financing);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be stoped! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  delete: function(financingAlias) {
    let transaction = $$.blockchain.beginTransaction({});

    let financing = transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.delete()) {
      return this.return(
        `Financing ${financingAlias} cannot be deleted because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      transaction.add(financing);
      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be deleted! ${err ? err.message : ""}`);
    }

    this.return(null);
  }
});

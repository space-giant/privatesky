$$.transaction.describe("FinancingManagement", {
  create: function(beneficiary, financingInfo) {
    let owner = $$.uidGenerator.safe_uuid();

    let financingAlias = $$.uidGenerator.safe_uuid();
    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.init(financingAlias, owner, beneficiary, financingInfo)) {
      return this.return(
        `Financing ${financingAlias} cannot be created for beneficiar ${beneficiary} because financing exists already!`
      );
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing creation failed for beneficiary ${beneficiary}! ${err ? err.message : ""}`);
    }

    this.return(null, {
      financing: financingAlias,
      owner
    });
  },

  updateInfo: function(financingAlias, financingInfo) {
    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.updateInfo(financingInfo)) {
      return this.return(`Financing ${financingAlias} cannot be updated because it doesn't exist!`);
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing update info failed! ${err ? err.message : ""}`);
    }

    this.return(null, {
      financing: financingAlias,
      financingInfo: financingInfo
    });
  },

  approve: function(financingAlias) {

    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.approve()) {
      return this.return(
        `Financing ${financingAlias} cannot be approved because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be approved! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  reject: function(financingAlias) {
    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.reject()) {
      return this.return(
        `Financing ${financingAlias} cannot be rejectd because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be rejectd! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  apply: function(financingAlias) {

    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.apply()) {
      return this.return(
        `Financing ${financingAlias} cannot be applied because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be applied! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  start: function(financingAlias, tokenInfo, mainToken) {
    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.isValid()) {
      return this.return(`Financing ${financingAlias} is not valid!`);
    }

    if (!financing.canStart()) {
      return this.return(
        `Financing ${financingAlias} cannot be started because it has the following status: ${financing.getStatus()}!`
      );
    }

    let owner = financing.getOwner();

    let account = this.transaction.lookup("artchain.Account", owner);
    account.init(); // ensure that the account is created

    let sharesToken = $$.uidGenerator.safe_uuid();
    let newToken = this.transaction.lookup("artchain.Token", sharesToken);

    if (!newToken.init(sharesToken, tokenInfo.name, tokenInfo.symbol, owner))
      return this.return(`Share token ${sharesToken} already exists!`);
    if (!newToken.emit(tokenInfo.supply)) return this.return("Share token cannot be emitted!");

    let sharesWalletAlias = $$.uidGenerator.safe_uuid();
    if (!account.addWallet(sharesToken, sharesWalletAlias)) {
      return this.return(`Owner ${owner} already has an wallet for share token ${sharesToken}!`);
    }

    let sharesWallet = this.transaction.lookup("artchain.Wallet", sharesWalletAlias);
    if (!sharesWallet.init(sharesWalletAlias, sharesToken, owner)) {
      return this.return(
        `Owner ${owner} cannot create wallet for token ${sharesToken} because generated wallet address (${sharesWalletAlias}) is already in use!`
      );
    }

    let mainWalletAlias = $$.uidGenerator.safe_uuid();
    if (!account.addWallet(mainToken, mainWalletAlias)) {
      return this.return(`Owner ${owner} already has an wallet for main token ${mainToken}!`);
    }

    let mainWallet = this.transaction.lookup("artchain.Wallet", mainWalletAlias);
    if (!mainWallet.init(mainWalletAlias, mainToken, owner)) {
      return this.return(
        `Owner ${owner} cannot create wallet for main token ${mainToken} because generated wallet address (${mainWalletAlias}) is already in use!`
      );
    }

    sharesWallet.receive(tokenInfo.supply);

    financing.setToken(sharesToken);
    financing.setOwnerWallets(mainWalletAlias, sharesWalletAlias);
    financing.start();

    try {
      this.transaction.add(financing);
      this.transaction.add(account);
      this.transaction.add(newToken);
      this.transaction.add(sharesWallet);
      this.transaction.add(mainWallet);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be started! ${err ? err.message : ""}`);
    }

    this.return(null, {
      financing: financingAlias,
      token: sharesToken,
      sharesWallet: sharesWalletAlias,
      mainWallet: mainWalletAlias
    });
  },

  stop: function(financingAlias) {

    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.stop()) {
      return this.return(
        `Financing ${financingAlias} cannot be stoped because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be stoped! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  delete: function(financingAlias) {
    let financing = this.transaction.lookup("artchain.Financing", financingAlias);
    if (!financing.delete()) {
      return this.return(
        `Financing ${financingAlias} cannot be deleted because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be deleted! ${err ? err.message : ""}`);
    }

    this.return(null);
  },

  finalize: function(financingAlias) {
    let financing = this.transaction.lookup("artchain.Financing", financingAlias);

    let ownerSharesWallet = this.transaction.lookup("artchain.Wallet", financing.ownerSharesWallet);

    if (!ownerSharesWallet.isValid()) return this.return("Invalid wallet");
    if (!ownerSharesWallet.isActive()) return this.return("Wallet is not active.");
    if (ownerSharesWallet.getBalance() !== 0) {
      return this.return(
        `Expected shares wallet to have balance = 0, but instead found ${ownerSharesWallet.getBalance()}`
      );
    }

    if (!financing.finalize()) {
      return this.return(
        `Financing ${financingAlias} cannot be finalized because it has the following status: ${financing.getStatus()}!`
      );
    }

    try {
      this.transaction.add(financing);
      this.transaction.commit();
    } catch (err) {
      return this.return(`Financing ${financingAlias} failed to be finalized! ${err ? err.message : ""}`);
    }

    this.return(null);
  }
});

function getAccountAlias(owner, token) {
  return `${owner}_${token}`;
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

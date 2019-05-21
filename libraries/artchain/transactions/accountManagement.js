$$.transaction.describe("accountManagement", {
    create: function (symbol, owner) {
        let transaction = $$.blockchain.beginTransaction({});
        let uid = $$.uidGenerator.safe_uuid();
        let account = transaction.lookup('token.Account', uid);

        account.init(uid, symbol, owner);

        try{
            transaction.add(account);
            $$.blockchain.commit(transaction);
        }catch(err){
            this.return("Account creation failed!");
            return;
        }
        this.return(null, uid);
    },
    close: function(accountId){
        let transaction = $$.blockchain.beginTransaction({});

        let account = transaction.lookup('token.Account', accountId);

        if(!account.valid()){
            this.return("Invalid account");
            return;
        }

        if(!account.active()){
            this.return("Account is not active.");
            return;
        }

        if(account.balance() > 0){
            this.return("Account balance to high.");
            return;
        }

        if(!account.close()){
            this.return("Account closing procedure failed.");
            return;
        }

        try{
            transaction.add(account);
            $$.blockchain.commit(transaction);
        }catch(err){
            this.return("Account closing procedure failed.");
            return;
        }

        this.return(null, accountId);
    },
    transfer: function(tokens, symbol, from, to){
        let transaction = $$.blockchain.beginTransaction({});

        let sourceAccount = transaction.lookup('token.Account', from);
        if(from.getSymbol() !== symbol || !from.transfer(tokens)){
            this.return("Transfer failed!");
            return;
        }

        let targetAccount = transaction.lookup('token.Account', to);
        if(to.getSymbol() !== symbol || !to.receive(tokens)){
            this.return("Transfer failed");
            return;
        }

        try{
            transaction.add(to);
            transaction.add(from);
            $$.blockchain.commit(transaction);
        }catch(err){
            this.return("Transfer failed!");
            return;
        }

        this.return(null, uid);
    },
    balanceOf: function(accountId){
        let transaction = $$.blockchain.beginTransaction({});
        let account = transaction.lookup('token.Account', accountId);

        if(!account.valid()){
            this.return("Invalid account");
            return;
        }

        if(!account.active()){
            this.return("Account is not active.");
            return;
        }

        this.return(null, account.balance());
    }
});
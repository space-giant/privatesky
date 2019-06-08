$$.transaction.describe("MigrationManagement", {
  run: function(name, run) {
    try {
      run = eval(`(${run})`);
    } catch (err) {
      return this.return(`"${name}" migration failed! Invalid provided run function ${err ? err.message : ""}`);
    }

    let transaction = $$.blockchain.beginTransaction({});

    let migrationRun = transaction.lookup("artchain.Migration", name);

    if (migrationRun.isExecuted(name)) {
      console.log(`"${name}" migration already executed!`);
      return this.return(`already_executed`);
    }

    run
      .call(this, transaction)
      .then(result => {
        try {
          migrationRun.store(name);
          transaction.add(migrationRun);
          $$.blockchain.commit(transaction);
        } catch (err) {
          console.log(err);
          return this.return(`"${name}" migration failed! ${err ? err.message : ""}`);
        }

        this.return(null, {
          info: migrationRun.getInfo(),
          result
        });
      })
      .catch(err => {
        this.return(`"${name}" migration failed! ${err ? err.message : ""}`);
      });
  }
});

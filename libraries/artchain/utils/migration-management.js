$$.transaction.describe("MigrationManagement", {
  run: function(name, run) {
    try {
      run = eval(`(${run})`);
    } catch (err) {
      return this.return(`"${name}" migration failed! Invalid provided run function ${err ? err.message : ""}`);
    }

    let transaction = $$.blockchain.beginTransaction({});

    let migrationRun = transaction.lookup("artchain.Migration", name);

    if (migrationRun.isExecuted(name)) return this.return(`"${name}" migration already executed!`);

    try {
      migrationRun.store(name);

      run(transaction);

      transaction.add(migrationRun);

      $$.blockchain.commit(transaction);
    } catch (err) {
      return this.return(`"${name}" migration failed! ${err ? err.message : ""}`);
    }

    this.return(null, migrationRun.getInfo());
  }
});

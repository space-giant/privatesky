$$.transaction.describe("MigrationManagement", {
  run: function(name, run) {
    try {
      run = eval(`(${run})`);
    } catch (err) {
      return this.return(`"${name}" migration failed! Invalid provided run function ${err ? err.message : ""}`);
    }

    let migrationRun = this.transaction.lookup("artchain.Migration", name);

    if (migrationRun.isExecuted(name)) {
      console.log(`"${name}" migration already executed!`);
      return this.return(`already_executed`, migrationRun.getResult());
    }

    run
      .call(this, this.transaction)
      .then(result => {
        try {
          migrationRun.store(name, result);
          this.transaction.add(migrationRun);
          this.transaction.commit();
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

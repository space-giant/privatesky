$$.asset.describe("Migration", {
  public: {
    alias: "string:alias",
    name: "string",
    executionDate: "string",
    result: "object"
  },

  isExecuted: function(name) {
    // return false;
    return this.name === name;
  },

  store: function(name, result) {
    this.alias = name;
    this.name = name;
    this.executionDate = new Date().toISOString();
    this.result = result;

    console.log(`Storing migration "${name}" at ${this.executionDate}`);

    return true;
  },

  getInfo: function() {
    return {
      name: this.name,
      executionDate: this.executionDate
    };
  },

  getResult: function() {
    return this.result;
  }
});

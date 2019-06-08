$$.asset.describe("Migration", {
  public: {
    alias: "string:alias",
    name: "string",
    executionDate: "string"
  },

  isExecuted: function(name) {
    return this.name === name;
  },

  store: function(name) {
    this.alias = name;
    this.name = name;
    this.executionDate = new Date().toISOString();

    console.log(`Storing migration "${name}" at ${this.executionDate}`);

    return true;
  },

  getInfo: function() {
    return {
      name: this.name,
      executionDate: this.executionDate
    };
  }
});

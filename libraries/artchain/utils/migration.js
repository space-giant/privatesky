$$.asset.describe("Migration", {
  public: {
    name: "string:alias",
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

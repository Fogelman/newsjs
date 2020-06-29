const mongodb = require("mongodb");
require("dotenv/config");

class Connector {
  constructor() {
    this.uri = process.env.MONGODB_URI;
  }

  async connect() {
    this.connection = await mongodb.connect(this.uri);
  }

  async insert() {}
}

module.exports = Connector;

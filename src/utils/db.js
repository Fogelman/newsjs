const Client = require("mongodb").MongoClient;
require("dotenv/config");

class DB {
  constructor() {
    this.connection = null;
    this.uri = process.env.MONGODB_URI;
    this.database = "tasks";
    this.collection = "documents";
  }

  async connect() {
    const { database, collection } = this;
    this.connection = new Client(this.uri, { useUnifiedTopology: true });
    await this.connection.connect();
    this.collection = this.connection.db(database).collection(collection);
  }

  async insert(payload) {
    return await this.collection.insertOne({ ...payload });
  }

  async update(id, payload) {
    return await this.collection.updateOne({ _id: id }, { ...payload });
  }

  async close() {
    await this.connection.close();
  }
}

module.exports = DB;

// (async()=>{
//   const connector = new DB();
//   console.log(process.env.MONGODB_URI);
//   await connector.connect();

//   await connector.insert(123, {name:"David Fogelman"})
//   await connector.close();
// })();

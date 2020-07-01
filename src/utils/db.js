const { ObjectID, MongoClient } = require("mongodb");

require("dotenv/config");

class DB {
  constructor({ database = "tasks", collection = "documents" } = {}) {
    this.connection = null;
    this.uri = process.env.MONGODB_URI;
    this.database = database;
    this.collection = collection;
  }

  async connect() {
    const { database, collection } = this;
    this.connection = new MongoClient(this.uri, { useUnifiedTopology: true });
    await this.connection.connect();
    this.collection = this.connection.db(database).collection(collection);
  }

  async insert(payload) {
    return await this.collection.insertOne({ ...payload });
  }

  async insertMany(payload) {
    return await this.collection.insertMany(payload);
  }

  async update(_id, payload) {
    return await this.collection.updateOne(
      { _id: ObjectID(_id) },
      { $set: payload }
    );
  }

  async find(filter = {}) {
    return await this.collection.find(filter).toArray();
  }

  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
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

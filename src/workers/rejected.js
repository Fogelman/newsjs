const amqp = require("amqplib");
const DB = require("./../utils/db");

require("dotenv/config");

class Worker {
  constructor(uri) {
    this.uri = uri;
    this.connection = null;
    this.db = new DB({
      database: process.env.MONGODB_DATABASE,
      collection: process.env.MONGODB_COLLECTION_REJECTED,
    });
  }

  async connect() {
    this.connection = await amqp.connect(this.uri);
    await this.db.connect();
  }

  async setup() {
    const { connection } = this;
    let channel = await connection.createChannel();

    await channel.assertExchange("rejected", "direct", { durable: true });
    await channel.assertQueue("rejected.all", { durable: true });
    await channel.bindQueue("rejected.all", "rejected", "download");
    await channel.bindQueue("rejected.all", "rejected", "files");
    await channel.bindQueue("rejected.all", "rejected", "pages");
  }

  async listen() {
    // connect to Rabbit MQ
    const { connection } = this;
    let channel = await connection.createChannel();
    await channel.prefetch(5);

    // start consuming messages
    await this.consume({ connection, channel });
  }

  async job(payload, db) {
    await db.insert({ ...payload, rejected: true });
  }

  async consume({ connection, channel }) {
    const { job, db } = this;
    return new Promise((resolve, reject) => {
      const tag = channel.consume("rejected.all", async function (msg) {
        let body = msg.content.toString();
        let data = JSON.parse(body);
        try {
          await job({ ...data, key: msg.fields.routingKey }, db);
          await channel.ack(msg);
        } catch (err) {
          console.error(err);
          await channel.reject(msg, false);
        }
      });

      // handle connection closed
      connection.on("close", (err) => {
        return reject(err);
      });

      // handle errors
      connection.on("error", (err) => {
        return reject(err);
      });
    });
  }
}

(async () => {
  const worker = new Worker(process.env.RABBITMQ_URI);
  await worker.connect();
  await worker.setup();
  await worker.listen();
})();

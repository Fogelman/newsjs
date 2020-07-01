require("dotenv/config");
const amqp = require("amqplib");
const path = require("path");
const fs = require("fs");

const { promisify } = require("util");

const Parse = require("./../utils/parse");
const Request = require("./../utils/request");

class Worker {
  constructor(uri) {
    this.uri = uri;
    this.connection = null;
  }

  async connect() {
    this.connection = await amqp.connect(this.uri);
  }

  async setup() {
    const { connection } = this;
    let channel = await connection.createChannel();
    await channel.assertQueue("processing.download", {
      durable: true,
      deadLetterExchange: "rejected",
    });

    await channel.assertExchange("processing", "direct", { durable: true });
    await channel.bindQueue("processing.download", "processing", "download");
  }

  async listen() {
    // connect to Rabbit MQ
    const { connection } = this;
    let channel = await connection.createChannel();
    await channel.prefetch(5);

    // start consuming messages
    await this.consume({ connection, channel });
  }

  async job(payload) {
    let { href, name, filetype, baseURL } = payload;
    let res = await Request.download({ url: href, baseURL });
    let filename = `${Parse.id(href)}-${Parse.sequence(href)}.${Parse.extension(
      name
    )}`;
    let pth = path.resolve(__dirname, "..", "..", "tmp", filename);

    if (filetype === "HTML") {
      await promisify(fs.writeFile)(pth, res.toString("latin1"));
    } else {
      await promisify(fs.writeFile)(pth, res);
    }
  }

  async consume({ connection, channel }) {
    const { job } = this;
    return new Promise((resolve, reject) => {
      channel.consume("processing.download", async function (msg) {
        let body = msg.content.toString();
        let data = JSON.parse(body);
        try {
          await job(data);
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

const amqp = require("amqplib");

const str = "amqp://localhost";
async function setup() {
  let connection = await amqp.connect(str);
  let channel = await connection.createChannel();
  await channel.assertExchange("processing", "direct", { durable: true });
  await channel.assertQueue("processing.rejected", { durable: true });
  await channel.bindQueue("processing.rejected", "processing", "todos");
  await connection.close();
}

function consume({ connection, channel }) {
  return new Promise((resolve, reject) => {
    channel.consume("processing.rejected", async function (msg) {
      let body = msg.content.toString();
      let data = JSON.parse(body);
      // let id = data.requestId;
      // let processingResults = data.processingResults;
      console.log(data);
      await channel.ack(msg);
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

async function listen() {
  // connect to Rabbit MQ
  let connection = await amqp.connect(str);

  let channel = await connection.createChannel();
  await channel.prefetch(1);

  // start consuming messages
  await consume({ connection, channel });
}

(async () => {
  await setup();
  await listen();
})();

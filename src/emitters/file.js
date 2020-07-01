const Emit = require("./utils/emit");
const amqp = require("amqplib");
const fs = require("fs");
const { resolve } = require("path");
require("dotenv/config");

async function run() {
  let connection = await amqp.connect(process.env.RABBITMQ_URI);
  let channel = await connection.createConfirmChannel();
  let path = resolve(__dirname, "..", "tmp", "links.json");
  const pages = JSON.parse(fs.readFileSync(path));

  for (var i = 0; i < pages.length; i++) {
    var obj = pages[i];
    await Emit.publish(channel, {
      exchange: "processing",
      key: "request",
      data: {
        ...obj,
        baseURL: "https://www2.senado.leg.br",
      },
    });
  }

  await connection.close();
}

run();

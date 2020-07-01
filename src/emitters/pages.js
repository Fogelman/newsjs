const amqp = require("amqplib");
const fs = require("fs");

require("dotenv/config");

const Emit = require("./../utils/emit");

async function run() {
  let connection = await amqp.connect(process.env.RABBITMQ_URI);
  let channel = await connection.createConfirmChannel();

  const total = 49942;
  const rpp = 50;

  for (var i = 0; i < Math.ceil(total / rpp); i++) {
    var obj = { href: "/bdsf/handle/id/44/browse", rpp, offset: i * rpp };
    await Emit.publish(channel, {
      exchange: "processing",
      key: "pages",
      data: {
        ...obj,
        baseURL: "https://www2.senado.leg.br",
      },
    });
  }

  await connection.close();
}

run();

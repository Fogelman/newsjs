const fs = require("fs");
const amqp = require("amqplib");

require("dotenv/config");
const Emit = require("./../utils/emit");
const DB = require("./../utils/db");

async function run() {
  let connection = await amqp.connect(process.env.RABBITMQ_URI);
  let channel = await connection.createConfirmChannel();

  let db = new DB({
    database: process.env.MONGODB_DATABASE,
    collection: process.env.MONGODB_COLLECTION,
  });
  await db.connect();

  const news = await db.find();
  const files = news.flatMap((el) => {
    return el.files ? el.files : [];
  });

  for (var i = 0; i < files.length; i++) {
    var obj = files[i];

    await Emit.publish(channel, {
      exchange: "processing",
      key: "download",
      data: {
        ...obj,
        baseURL: "https://www2.senado.leg.br",
      },
    });
  }

  await db.close();

  await connection.close();
}

run();

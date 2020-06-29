const amqp = require("amqplib");
const str = "amqp://localhost";

function publish(channel, { exchange = "", key, data }) {
  return new Promise((resolve, reject) => {
    channel.publish(
      exchange,
      key,
      Buffer.from(JSON.stringify(data), "utf-8"),
      { persistent: true },
      function (err, ok) {
        if (err) {
          return reject(err);
        }

        resolve();
      }
    );
  });
}

async function emit() {
  let connection = await amqp.connect(str);
  let channel = await connection.createConfirmChannel();

  await publish(channel, {
    exchange: "processing",
    key: "request",
    data: "Do this job",
  });

  await connection.close();
}

emit();

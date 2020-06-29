const amqp = require("amqplib");
const str = "amqp://localhost";

function publish(channel, { routingKey, exchangeName, data }) {
  return new Promise((resolve, reject) => {
    channel.publish(
      exchangeName,
      routingKey,
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
  // connect to Rabbit MQ

  let connection = await amqp.connect(str);
  let channel = await connection.createConfirmChannel();

  await publish(channel, {
    routingKey: "request",
    exchangeName: "processing",
    data: "Do this job",
  });

  await connection.close();
}

emit();

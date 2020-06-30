const amqp = require("amqplib");
const str = "amqp://localhost";

class Emit {
  static async publish(channel, { exchange = "", key, data }) {
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
}

module.exports = Emit;

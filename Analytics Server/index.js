const amqp = require('amqplib');

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE = "rawEmoteExchange";
let rawEmoteData = [];
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;

async function analyzeData() {
    // TODO: Implement data analysis logic here
}
async function start() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "fanout", {
      durable: false,
    });

    const q = await channel.assertQueue("", {
      exclusive: true,
    });

    await channel.bindQueue(q.queue, EXCHANGE, "");

    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        try {
          const content = msg.content.toString();
          const data = JSON.parse(content);
          rawEmoteData.push(data);
          channel.ack(msg);
        
          console.log("Vastaanotettu:");
          console.log(data);
          
            if (rawEmoteData.length >= BATCH_SIZE) {
                analyzeData();
                rawEmoteData = [];
            }

        } catch (err) {
          console.error("Parsinta epäonnistui:", err);
        }
      }
    });

  } catch (err) {
    console.error("Virhe:", err);
  }
}

start();

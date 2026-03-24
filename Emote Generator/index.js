import amqp from 'amqplib';

let channel;
const exchangeName = 'rawEmoteExchange';

async function connectBroker() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertExchange(exchangeName, 'fanout', {durable: true});
        console.log("[GENRATOR] Connected to the broker, exchange created.");
        return true;
    } catch (error) {
        console.error("[GENERATOR] Failed to connect RabbitMQ: ", error);
        return false;
    }
}

function createEmote() {
    const emote = {
        emote: 'smiley',
        timestamp: new Date().toISOString()
    }
    return emote;
}

function generateEmotes() {
    setInterval(() => {
        const emote = createEmote();
        // publish emote to queue
        channel.publish(exchangeName, '', Buffer.from(JSON.stringify(emote)));
        console.log("[GENERATOR] Published an emote.");
    }, 1000);
}

async function main() {
 await connectBroker();
 if (channel) {
    generateEmotes();
 } else {
    console.error("Could not start Emote Generator, no RabbitMQ connection.");
 }
}
main();
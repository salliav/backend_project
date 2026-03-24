import amqp from 'amqplib';

let channel;
const exchangeName = 'rawEmoteExchange';
const url = process.env.RABBIT_URL || 'amqp://localhost'
const emotes = [
    "SMILEY",
    "ROCKET",
    "FIRE",
    "PARTY",
    "HEART",
    "SPARKLES",
    "CAT",
    "PIZZA",
    "TARGET",
    "GHOST"
];

async function connectBroker() {
    try {
        const connection = await amqp.connect(url);
        channel = await connection.createChannel();
        await channel.assertExchange(exchangeName, 'fanout', {durable: true});
        console.log("[GENERATOR] Connected to the broker, exchange created.");
        return true;
    } catch (error) {
        console.error("[GENERATOR] Failed to connect RabbitMQ: ", error);
        return false;
    }
}

function createEmote() {
    const index = Math.floor(Math.random() * 10);
    const emote = {
        emote: emotes[index],
        timestamp: new Date().toISOString()
    }
    return emote;
}

function generateEmotes() {
    // publish emote to queue every second
    setInterval(() => {
        const emote = createEmote();
        channel.publish(exchangeName, '', Buffer.from(JSON.stringify(emote)));
        console.log(`[GENERATOR] Published an emote: `, emote.emote);
    }, 1000);

    // publish burst of emotes at random times
    const triggerBurst = () => {
        const delay = 1000 + Math.floor(Math.random() * 5000); // Create burst between 5-10 s
        setTimeout(() => {      
            const sizeOfBurst = 1 + Math.floor(Math.random() * 50);
            const emote = createEmote();
            // publish a burst of emotes
            for (let i = 0; i < sizeOfBurst; i++) {
                channel.publish(exchangeName, '', Buffer.from(JSON.stringify(emote)));
            }
            console.log(`[GENERATOR] Published a burst of emotes: ${emote.emote}, X ${sizeOfBurst}`);
            triggerBurst();
        }, delay);
    }
    triggerBurst();
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
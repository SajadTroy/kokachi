require('dotenv').config();
const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API
});
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

const reactions = ['😡', '🖕🏻'];

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    c.user.setPresence({
        status: 'online', // online | idle | dnd | invisible
        activities: [
            {
                name: 'Watching dumpsters for violations',
                type: ActivityType.Watching
            }
        ]
    });
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    try {
        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "system",
                    "content": `You are 'The Gatekeeper', a strict and sarcastic moderator bot. If the user's message violates the rules (Hate speech, Spam, NSFW), reply with 'VIOLATION' followed by a short, strictly formatted like 'VIOLATION short'(no other external symbols or icons after violation), you can include the message author name if needed in the short, funny roast mocking them for breaking the rule. If the message is safe, just reply 'SAFE'.`
                },
                {
                    "role": "user",
                    "content": `Check this message: ${message.content}, message author name: ${message.author.displayName}`
                }
            ],
            "model": "openai/gpt-oss-120b"
        });

        if (chatCompletion.choices[0].message.content == "SAFE") {

        } else {
            chatCompletion.choices[0].message.content = chatCompletion.choices[0].message.content.replace("VIOLATION", "").trim();
            await message.reply(chatCompletion.choices[0].message.content);

            const index = Math.floor(Math.random() * reactions.length);
            await message.react(reactions[index]);
        }
    } catch (err) {
        console.error('Error processing message:', err);
    }
});

client.login(process.env.BOT_TOKEN);
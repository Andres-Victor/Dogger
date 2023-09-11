require('dotenv').config();
const { Client, Partials, GatewayIntentBits, Collection } = require('discord.js');
const {Guilds, GuildMembers,GuildMessages, MessageContent } = GatewayIntentBits;
const { User, Message,GuildMember,ThreadMember } = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMember, GuildMessages, MessageContent],
    partials: [User, Message, GuildMember, ThreadMember]
});

const { loadEvents } = require('./Handlers/eventHandler');

client.events = new Collection();
client.commands = new Collection();

loadEvents(client);

require('./Handlers/anti-Crash')(client);

client.login(process.env.DISCORD_TOKEN)
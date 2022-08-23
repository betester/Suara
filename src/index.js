require("dotenv").config();
const fs = require("fs");
const config = require("../config.json");

const token = process.env.BOT_TOKEN;
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent ],
});

client.commands = new Collection();
client.config = config;

const events = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));

for (const file of events) {
  const eventName = file.split(".")[0];
  const event = require(`./events/${file}`);
  client.on(eventName, event.bind(null, client));
}

const commands = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commands) {
  const commandName = file.split(".")[0];
  const command = require(`./commands/${file}`);
  client.commands.set(commandName, command);
}

client.login(token);

require("dotenv").config();
const fs = require("fs");
const config = require("../config.json");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { redisClient } = require("../database/index.js");
const token = process.env.BOT_TOKEN;
const VOICE_CHAT_ID = 2;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
client.redisClient = redisClient;
client.config = config;

const setRedisInitialValue = async (redisClient, channels) => {
  channels.forEach((channel) => {
    const guildId = channel.guild.id;
    const channelId = channel.id;

    channel.members.forEach(async (member) => {
      await redisClient.sAdd(`${guildId}:${channelId}`, member.user.username);
    });
  });
};

client.on("ready", async () => {
  //loading up initial data
  const channels = client.channels.cache.filter((channel) => channel.type == VOICE_CHAT_ID);
  await setRedisInitialValue(redisClient, channels);
  //event and command handling
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
    client.commands.set(commandName.toLowerCase(), command);
  }
});

client.login(token);

require("dotenv").config();
const fs = require("fs");
const config = require("../config.json");
const collection = require("./utils/collection.js");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const token = process.env.BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// 1. use sorted set on the redis ( or even normal set would work)
// 2. set the id into guildId:channelId = [list of users]

client.commands = new Collection();
client.voiceChatManagers = new Collection();
client.config = config;

const setRedisInitialValue =  async (redisClient,channels)  => {
  channels.forEach(channel => {
    const guildId = channel.guild.id;
    const channelId = channel.id;

    channel.members.forEach(async (member) => {
        await redisClient.sAdd(`${guildId}:${channelId}`,member.user.username);
    });
  })
}

const setInitialData = async (redisClient,channels) => {
  const { voiceChatManagers } = client;


  channels.forEach(async (voiceChannel)  => {
    const guildId = voiceChannel.guild.id;
    const guildVoiceChannels = collection.getOrCreateKey(
      voiceChatManagers,
      guildId,
      Collection
    );
    const voiceMembers = collection.getOrCreateKey(
      guildVoiceChannels,
      voiceChannel.id,
      Set
    );
    const members = await redisClient.SMEMBERS(`${guildId}:${voiceChannel.id}`)
    console.log(members)

    voiceChannel.members.forEach((member) => {
      voiceMembers.add(member.user.username);
    });
  });
}

client.on("ready", async () => {
  console.log(
    `Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`
  );
  const { redisClient } = await require("../database/index.js");


  //loading up initial data
  const channels = client.channels.cache.filter((channel) => channel.type == 2);
  setRedisInitialValue(redisClient,channels)
  setInitialData(redisClient,channels);


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

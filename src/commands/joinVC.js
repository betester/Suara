const GENERAL_ID = "1011569341835268156";
const NEW_GENERAL_ID = "1011651851944464415";
const GUILD_ID = "1011569341336129606";
const { joinVoiceChannel } = require("@discordjs/voice");

exports.run = async (client, message, args) => {
  let switchNumbers = args[0];
  const guild = await client.guilds.fetch(GUILD_ID);
  let switcher = true;

  while (switchNumbers) {
    joinVoiceChannel({
      channelId: switcher ? GENERAL_ID : NEW_GENERAL_ID,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    switcher = !switcher;
    switchNumbers--;
  }
};

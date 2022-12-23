const { getLastTimeStamp } = require("../../database/service/getLastTimeStamp");
const { getUserTimeStamp } = require("../../database/service/getUserTimeStamp");
const { getUser } = require("../../prisma/service/getUser");
const { saveUser } = require("../../prisma/service/saveUser");
const { sendProfileEmbed } = require("../service/sendProfileEmbed");

exports.run = async (_, message) => {
  try {
    const userId = message.author.username;
    const guildId =  message.guild.id
    const channel = message.member.voice.channel;

    if (channel) {
        const timeStamp = await getUserTimeStamp(userId,channel.id,guildId);
        await saveUser(userId, Date.now() - parseInt(timeStamp));
    }

    let user = await getUser(userId);
    sendProfileEmbed(message.channel,userId,user.timeSpent);

  } catch (e) {
    console.log(e);
  }
};

exports.name = "profile";

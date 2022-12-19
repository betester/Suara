const { filter } = require("bluebird");
const { EmbedBuilder } = require("discord.js");

const sendEmbeds = (channel, userId, status, targetChannel, sourceChannel) => {
  let description = "";
  let color = "#0099ff";

  const filteredUser = channel.members
    .filter((member) => member.user.username === userId);

  const user = Array.from(filteredUser).map(([_, value]) => (value));

  if (status === "join") {
    description = `${userId} Joined ${targetChannel} voice chat`;
  } else if (status === "left") {
    description = `${userId} Left ${channel.name} voice chat`;
    color = "#DC0000";
  } else if (status === "change") {
    description = `${userId} Moved from ${sourceChannel} to ${targetChannel} voice chat`;
    color = "#FFE15D";
  }

  try {
    const messageEmbed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({
        iconURL: `https://cdn.discordapp.com/avatars/${user[0].user.id}/${user[0].user.avatar}.png`,
        name: userId,
      })
      .setDescription(description);
    channel.send({ embeds: [messageEmbed] });
  } catch (e) {
    console.log(e);
  }
};

exports.sendEmbeds = sendEmbeds;

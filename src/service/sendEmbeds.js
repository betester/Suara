const { EmbedBuilder } = require("discord.js");

const sendEmbeds = (channel, userId, status, targetChannel, sourceChannel) => {
  let description = "";
  let color = "#0099ff";

  const user = channel.members.map(
    (member) => member.user.username === userId && member
  );

  if (status === "join") {
    description = `Joined ${targetChannel} voice chat`;
  } else if (status === "left") {
    description = `Left ${channel.name} voice chat`;
    color = "#DC0000";
  } else if (status === "change") {
    description = `Moved from ${sourceChannel} to ${targetChannel} voice chat`;
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

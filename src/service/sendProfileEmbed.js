const { filter } = require("bluebird");
const { EmbedBuilder } = require("discord.js");
const moment = require('moment')

const sendProfileEmbed = (channel, userId, timeSpent) => {
  let color = "#0099ff";

  const filteredUser = channel.members.filter(
    (member) => member.user.username === userId
  );

  const user = Array.from(filteredUser).map(([_, value]) => value);
  const formattedTime = moment(timeSpent).from(0).split(" ");
  try {
    const messageEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${userId} Profile`)
      .setThumbnail(
        `https://cdn.discordapp.com/avatars/${user[0].user.id}/${user[0].user.avatar}.png`
      )
      .addFields({ name: "Total Voice Chat Time", value: `${formattedTime[1]} ${formattedTime[2]}` });
    channel.send({ embeds: [messageEmbed] });
  } catch (e) {
    console.log(e);
  }
};

exports.sendProfileEmbed = sendProfileEmbed;

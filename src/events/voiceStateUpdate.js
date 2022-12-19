const { addUser } = require("../../database/service/addUser");
const { removeUser } = require("../../database/service/removeUser");
const { getChannel } = require("../service/getChannel");
const { sendEmbeds } = require("../service/sendEmbeds");

const handleUserJoin = async (client, newState) => {
  const channel = await getChannel(client, newState.guild.systemChannelId);
  const newStatechannel = await getChannel(client, newState.channelId);
  const currentUsersId = newStatechannel.members.map(
    (member) => member.user.username
  );

  const newUser = await addUser(
    newState.channelId,
    newState.guildId,
    currentUsersId
  );

  newUser && sendEmbeds(channel, newUser, "join", newStatechannel.name);
  // simpan ke redis user yang baru join berdasarkan channelId dan guildId
  // send just joined channel message
};

const handleUserOtherAction = async (client, newState, oldState) => {
  // check dulu kalau channel id-nya sama atau engga
  if (newState.channelId === oldState.channelId) return;

  // kalau gak,
  // 1. di redis remove user dari set berdasarkan old id channel dan guildId
  // 2. di redis tambahin user ke set berdasarkan old id channel dan guildId
  // 3. send user just moved from blablabla
  const channel = await getChannel(client, oldState.guild.systemChannelId);
  const newStateChannel = await getChannel(client, newState.channelId);
  const oldStateChannel = await getChannel(client, oldState.channelId);
  const newChannelUserIds = newStateChannel.members.map(
    (member) => member.user.username
  );
  const oldChannelUserIds = oldStateChannel.members.map(
    (member) => member.user.username
  );
  await removeUser(oldState.channelId, oldState.guildId, oldChannelUserIds);
  const newUser = await addUser(
    newState.channelId,
    newState.guildId,
    newChannelUserIds
  );

  newUser &&
    sendEmbeds(
      channel,
      newUser,
      "change",
      newStateChannel.name,
      oldStateChannel.name
    );
};

const handleUserLeave = async (client, oldState) => {
  // remove dari redis user yang leave berdasarkan channelId dan guildId
  const channel = await getChannel(client, oldState.guild.systemChannelId);
  const oldChannel = await getChannel(client, oldState.channelId);
  const currentUsersId = oldChannel.members.map(
    (member) => member.user.username
  );
  const leavingUser = await removeUser(
    oldState.channelId,
    oldState.guildId,
    currentUsersId
  );

  leavingUser && sendEmbeds(channel, leavingUser, "left", oldChannel.name);
};

module.exports = async (client, oldState, newState) => {
  if (!oldState.channelId && newState.channelId)
    handleUserJoin(client, newState);
  else if (oldState.channelId && newState.channelId)
    handleUserOtherAction(client, newState, oldState);
  else if (oldState.channelId && !newState.channelId)
    handleUserLeave(client, oldState);
  else console.log("Other weird action happened");
};

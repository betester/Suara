const { addUser } = require("../../database/service/addUser");
const {
  deleteUserTimeStamp,
} = require("../../database/service/deleteUserTimeStamp");
const { isUserBlocked } = require("../../database/service/isUserBlocked");
const { removeUser } = require("../../database/service/removeUser");
const {
  saveUserTimeStamp,
} = require("../../database/service/saveUserTimeStamp");
const { saveUser } = require("../../prisma/service/saveUser");
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
    newState.guild.id,
    currentUsersId
  );

  saveUserTimeStamp(newUser, newState.guild.id, newState.channelId);

  if (newUser) {
    if (!(await isUserBlocked(newUser, newState.guild.id))) {
      sendEmbeds(channel, newUser, "join", newStatechannel.name);
      client.emit(
        "voiceStateComplete",
        channel,
        newUser,
        newState.guild.id,
        newState.channelId
      );
    }
  }

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
  await removeUser(oldState.channelId, oldState.guild.id, oldChannelUserIds);
  const newUser = await addUser(
    newState.channelId,
    newState.guild.id,
    newChannelUserIds
  );


  if (newUser) {

    const timeStamp = await deleteUserTimeStamp(newUser, oldState.guild.id, oldState.channelId);
    saveUserTimeStamp(newUser, newState.guild.id, newState.channelId);
    saveUser(newUser, timeStamp);

    if (!(await isUserBlocked(newUser, newState.guild.id))) {
      sendEmbeds(
        channel,
        newUser,
        "change",
        newStateChannel.name,
        oldStateChannel.name
      );
      client.emit(
        "voiceStateComplete",
        channel,
        newUser,
        newState.guild.id,
        newState.channelId
      );
    }
  }
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
    oldState.guild.id,
    currentUsersId
  );

  // delete user time stamp, and do the updates

  if (leavingUser) {
    const timeStamp = await deleteUserTimeStamp(
      leavingUser,
      oldState.guild.id,
      oldState.channelId
    );
    saveUser(leavingUser, timeStamp);
    if (!(await isUserBlocked(leavingUser, oldState.guild.id))) {
      sendEmbeds(channel, leavingUser, "left", oldChannel.name);
      client.emit(
        "voiceStateComplete",
        channel,
        leavingUser,
        oldState.guild.id,
        oldState.channelId
      );
    }
  }
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

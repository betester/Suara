// alur kode
// 1. voiceState berubah, oldState, newState
// 2. oldState == null && newState != null, baru join
// 3. oldState != null && newState != null, oldState != newState, pindah channel
// 3.1 oldState != null && newState != null, oldState == newState, deafen, dkk
// 4. oldState != null && newState == null, user leave
// Problem,
// discord js cuman ngasih tau user apa aja yang ada di suatu channel, tp g ngasih tau
// siapa yang pindah, problem kalau user baru join/left
// Solusi sementara, simpan di redis

const { addUser } = require("../../database/service/addUser");
const { removeUser } = require("../../database/service/removeUser");
const { getChannel } = require("..//service/getChannel");

const handleUserJoin = async (client, newState) => {
  const channel = await getChannel(client, newState.channelId);
  const currentUsersId = channel.members.map(member => member.user.username);
  const newUser = await addUser(newState.channelId,newState.guildId,currentUsersId);
  channel.send(`${newUser} joined ${channel.name} voice chat`)
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

  const newStateChannel = await getChannel(client, newState.channelId);
  const oldStateChannel = await getChannel(client, oldState.channelId);
  const newChannelUserIds = newStateChannel.members.map(member => member.user.username);
  const oldChannelUserIds = oldStateChannel.members.map(member => member.user.username)
  await removeUser(oldState.channelId,oldState.guildId, oldChannelUserIds);
  const newUser = await addUser(newState.channelId,newState.guildId,newChannelUserIds);
  channel.send(`${newUser} moved from ${oldStateChannel.name} to ${newStateChannel.name}`);

};

const handleUserLeave = async (client, oldState) => {
  // remove dari redis user yang leave berdasarkan channelId dan guildId
  const channel = await getChannel(client, oldState.channelId);
  const currentUsersId = channel.members.map(member => member.user.username);
  const leavingUser = await removeUser(oldState.channelId,oldState.guildId,currentUsersId);
  // send leave channel message
  channel.send(`${leavingUser} left ${channel.name} voice chat`)
};

module.exports = async (client, newState, oldState) => {
  if (!oldState && newState) handleUserJoin(client,newState);
  else if (oldState && newState) handleUserOtherAction(client, newState, oldState);
  else if (oldState && !newState) handleUserLeave(client, oldState);
  else console.log("Other weird action happened");
};

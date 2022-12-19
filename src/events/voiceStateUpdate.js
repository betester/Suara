const setUtil = require("../utils/set.js");
var Mutex = require("async-mutex").Mutex;
const mutex = new Mutex();

// TODO: refactor
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



const fetchChannel = (client, channelId, args, callback) => {
  if (!channelId) return;
  return client.channels
    .fetch(channelId)
    .then((channel) => callback(channel, args));
};

const getSetOfUsernameFromVC = (channel) => {
  const set = new Set();
  channel.members.forEach((member) => {
    set.add(member.user.username);
  });

  return set;
};

const fetchRedisData = async (client, oldState, newState) => {
  const { redisClient } = client;

  const newStateData = await fetchChannel(
    client,
    newState.channelId,
    {
      redisClient: redisClient,
      guildId: newState.guild.id,
    },
    handleUserAction
  );
  const oldStateData = await fetchChannel(
    client,
    oldState.channelId,
    {
      redisClient: redisClient,
      guildId: oldState.guild.id,
    },
    handleUserAction
  );

  return { newStateData: newStateData, oldStateData: oldStateData };
};

const handleUserAction = async (channel, data) => {
  const { redisClient, guildId } = data;
  const key = `${guildId}:${channel.id}`;

  try {
    const channelUsers = await redisClient.sMembers(key);
    const currentChannelUsers = getSetOfUsernameFromVC(channel);
    const changedStateUser = setUtil.findMissingElement(
      currentChannelUsers,
      new Set(channelUsers)
    );

    if (currentChannelUsers.size > channelUsers.length) {
      await redisClient.sAdd(key, changedStateUser);
    } else {
      await redisClient.sRem(key, changedStateUser);
    }
    return { username: changedStateUser, channelName: channel.name };
  } catch (error) {
    console.log(error);
  }
};

const sendJoinedUserMessage = (
  client,
  oldState,
  newState,
  newStateData,
  oldStateData
) => {
  try {
    if (!(oldState.channelId) && newStateData ) {
      client.channels.fetch(oldState.guild.systemChannelId).then((channel) => {
        channel.send(
          `${newStateData.username} joined ${newStateData.channelName} voice chat`
        );
      });
    } else if (!(newState.channelId)  && oldStateData ) {
      client.channels.fetch(newState.guild.systemChannelId).then((channel) => {
        channel.send(
          `${oldStateData.username} left ${oldStateData.channelName} voice chat`
        );
      });
    } else if (newStateData & oldStateData ) {
      client.channels.fetch(newState.guild.systemChannelId).then((channel) => {
        channel.send(
          `${newStateData.username} moved from ${oldStateData.channelName} to ${newStateData.channelName}`
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = async (client, oldState, newState) => {
  if (oldState.channelId === newState.channelId) {
    return;
  }

  const release = await mutex.acquire();

  try {
    const { oldStateData, newStateData } = await fetchRedisData(
      client,
      oldState,
      newState
    );

    sendJoinedUserMessage(
      client,
      oldState,
      newState,
      newStateData,
      oldStateData
    );
  } catch (error) {
  } finally {
    release();
  }
};

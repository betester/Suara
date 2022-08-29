const setUtil = require("../utils/set.js");
var Mutex = require("async-mutex").Mutex;
const mutex = new Mutex();

// TODO: refactor
const fetchChannel = (client, channelId, args, callback) => {
  if (channelId == null) return;
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
    if (oldState.channelId == null && newStateData != null) {
      client.channels.fetch(oldState.guild.systemChannelId).then((channel) => {
        channel.send(
          `${newStateData.username} joined ${newStateData.channelName} voice chat`
        );
      });
    } else if (newState.channelId == null && oldStateData != null) {
      client.channels.fetch(newState.guild.systemChannelId).then((channel) => {
        channel.send(
          `${oldStateData.username} left ${oldStateData.channelName} voice chat`
        );
      });
    } else if ((newStateData != null) & (oldStateData != null)) {
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

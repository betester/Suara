var Mutex = require("async-mutex").Mutex;
const mutex = new Mutex();
const setUtil = require("../utils/set.js");

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
    // watches this particular key
    redisClient.watch(key);
    // if there are other proccess that tries to  get members, this whole transaction will fail
    // and will be restarted again by the catch block
    const channelUsers = await redisClient.multi().sMembers(key).exec();
    const currentChannelUsers = getSetOfUsernameFromVC(channel);
    const changedStateUser = setUtil.findMissingElement(
      currentChannelUsers,
      new Set(channelUsers[0])
    );

    if (currentChannelUsers.size > channelUsers[0].length) {
      await redisClient.multi().sAdd(key, changedStateUser).exec();
    } else {
      await redisClient.multi().sRem(key, changedStateUser).exec();
    }
    return { username: changedStateUser, channelName: channel.name };
  } catch (error) {
    // try again untill no error?
    console.log(error);
    return await handleUserAction(channel, data);
  } finally {
    redisClient.unwatch();
  }
};

module.exports = async (client, oldState, newState) => {
  if (oldState.channelId === newState.channelId) {
    return;
  }

  const { oldStateData, newStateData } = await fetchRedisData(
    client,
    oldState,
    newState
  );

  try {
    if (oldState.channelId == null) {
      client.channels.fetch(oldState.guild.systemChannelId).then((channel) => {
        channel.send(
          `${newStateData.username} joined ${newStateData.channelName} voice chat`
        );
      });
    } else if (newState.channelId == null) {
      client.channels.fetch(newState.guild.systemChannelId).then((channel) => {
        channel.send(
          `${oldStateData.username} left ${oldStateData.channelName} voice chat`
        );
      });
    } else {
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

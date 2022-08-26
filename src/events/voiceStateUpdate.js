var Mutex = require("async-mutex").Mutex;
const mutex = new Mutex();

const fetchChannel = (client, channelId, args, callback) => {
  if (channelId == null) return;
  return client.channels
    .fetch(channelId)
    .then((channel) => callback(channel, args));
};

const findMissingElement = (largerSet, smallerSet) => {
  for (const element of largerSet) {
    if (!smallerSet.has(element)) {
      return element;
    }
  }
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
  let newStateData;
  let oldStateData;

  await mutex.runExclusive(async () => {
    const redisNewStateChannelUsers = await redisClient.SMEMBERS(
      `${newState.guild.id}:${newState.channelId}`
    );

    const redisOldStateChannelUsers = await redisClient.SMEMBERS(
      `${oldState.guild.id}:${oldState.channelId}`
    );

    newStateData = await fetchChannel(
      client,
      newState.channelId,
      {
        redisClient: redisClient,
        channelUsers: redisNewStateChannelUsers,
        guildId: newState.guild.id,
      },
      handleUserAction
    );
    oldStateData = await fetchChannel(
      client,
      oldState.channelId,
      {
        redisClient: redisClient,
        channelUsers: redisOldStateChannelUsers,
        guildId: oldState.guild.id,
      },
      handleUserAction
    );
  });

  return { newStateData: newStateData, oldStateData: oldStateData };
};

const handleUserAction = async (channel, data) => {
  const { channelUsers, redisClient, guildId } = data;
  const currentChannelUsers = getSetOfUsernameFromVC(channel);
  let changedStateUser;

  // user joined
  try {
    if (currentChannelUsers.size > channelUsers.length) {
      changedStateUser = findMissingElement(
        currentChannelUsers,
        new Set(channelUsers)
      );
      await redisClient
        .multi()
        .sAdd(`${guildId}:${channel.id}`, changedStateUser)
        .exec();
    } else {
      changedStateUser = findMissingElement(
        new Set(channelUsers),
        currentChannelUsers
      );
      await redisClient
        .multi()
        .sRem(`${guildId}:${channel.id}`, changedStateUser)
        .exec();
    }

    return { oldStateData: null, newStateData: null };
  } catch (error) {
    console.log(error);
  }
  return { username: changedStateUser, channelName: channel.name };
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

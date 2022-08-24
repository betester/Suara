const { Collection } = require("discord.js");
const collection = require('../utils/collection.js');

// TODO: move this into channel utils
const fetchChannel = (client, channelId, args, callback) => {
  if (channelId == null) return;
  return client.channels
    .fetch(channelId)
    .then((channel) => callback(channel, args));
};

const userAction = (oldStateChannelId, newStateChannelId) => {
  if (oldStateChannelId !== undefined && newStateChannelId !== undefined) {
    return "MOVE";
  }
  return "JOIN OR LEFT";
};

// TODO: move this to set utils
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

const handleUserAction = (channel, channelUsers) => {
  const currentChannelUsers = getSetOfUsernameFromVC(channel);
  let changedStateUser;

  // user joined
  if (currentChannelUsers.size > channelUsers.size) {
    changedStateUser = findMissingElement(currentChannelUsers, channelUsers);
    channelUsers.add(changedStateUser);
  }
  // user left
  else {
    changedStateUser = findMissingElement(channelUsers, currentChannelUsers);
    channelUsers.delete(changedStateUser);
  }
  return { username: changedStateUser, channelName: channel.name };
};



module.exports = async (client, oldState, newState) => {
  const { voiceChatManagers } = client;

  const guildChannels = collection.getOrCreateKey(
    voiceChatManagers,
    newState.guild.id,
    Collection
  );

  const newStateChannelUsers = collection.getOrCreateKey(
    guildChannels,
    newState.channelId,
    Set
  );
  const oldStateChannelUsers = collection.getOrCreateKey(
    guildChannels,
    oldState.channelId,
    Set
  );

  const newStateData = await fetchChannel(
    client,
    newState.channelId,
    newStateChannelUsers,
    handleUserAction
  );
  const oldStateData = await fetchChannel(
    client,
    oldState.channelId,
    oldStateChannelUsers,
    handleUserAction
  );

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
};

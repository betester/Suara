const { VoiceStateManager, Collection } = require("discord.js");

const fetchChannel = (client, channelId, callback) => {
  if (channelId == null) return;
  return client.channels.fetch(channelId).then(callback);
};

const userAction = (oldStateChannelId, newStateChannelId) => {
  if (oldStateChannelId !== undefined && newStateChannelId !== undefined) {
    return "MOVE";
  }
  return "JOIN OR LEFT";
};

const findMissingElement = (largerSet, smallerSet) => {
  for (const element of largerSet) {
    if (!smallerSet.has(element)) {
      return username;
    }
}

const haandleUserAction = (channel, channelUsers) => {
  const currentChannelUsers = new Set();
  channel.members.forEach((member) => {
    currentChannelUsers.add(member.user.username);
  });

  let changedStateUser;

  // user joined
  if (currentChannelUsers.size > channelUsers.size) {
    for (const username of currentChannelUsers) {
      if (!channelUsers.has(username)) {
        changedStateUser = username;
        break;
      }
    }

    console.log(`${changedStateUser} joined voice chat`);
    channelUsers.add(changedStateUser);
  }
  // user left
  else {
    console.log("harusnya ini kepanggil kalo user left");
    for (const username of channelUsers) {
      if (!currentChannelUsers.has(username)) {
        changedStateUser = username;
        break;
      }
    }

    console.log(`${changedStateUser} left voice chat`);
    channelUsers.delete(changedStateUser);
  }
  console.log(guildChannels);
  console.log(voiceChatManagers);
};

module.exports = (client, oldState, newState) => {
  const { voiceChatManagers } = client;

  if (!voiceChatManagers.get(newState.guild.id)) {
    voiceChatManagers.set(newState.guild.id, new Collection());
  }

  const guildChannels = voiceChatManagers.get(newState.guild.id);

  // handle if channelUsers is undefined
  if (!guildChannels.get(newState.channelId)) {
    guildChannels.set(newState.channelId, new Set());
  }

  const channelUsers = guildChannels.get(
    newState.channelId || oldState.channelId
  );

  fetchChannel(client, newState.channelId || oldState.channelId, (channel) => {
    const currentChannelUsers = new Set();
    channel.members.forEach((member) => {
      currentChannelUsers.add(member.user.username);
    });

    let changedStateUser;

    // user joined
    if (currentChannelUsers.size > channelUsers.size) {
      for (const username of currentChannelUsers) {
        if (!channelUsers.has(username)) {
          changedStateUser = username;
          break;
        }
      }

      console.log(`${changedStateUser} joined voice chat`);
      channelUsers.add(changedStateUser);
    }
    // user left
    else {
      console.log("harusnya ini kepanggil kalo user left");
      for (const username of channelUsers) {
        if (!currentChannelUsers.has(username)) {
          changedStateUser = username;
          break;
        }
      }

      console.log(`${changedStateUser} left voice chat`);
      channelUsers.delete(changedStateUser);
    }
    console.log(guildChannels);
    console.log(voiceChatManagers);
  });

  if (oldState.channelId == null) {
    client.channels.fetch(oldState.guild.systemChannelId).then((channel) => {
      channel.send("Someone joined the voice chat");
    });
  } else if (newState.channelId == null) {
    client.channels.fetch(newState.guild.systemChannelId).then((channel) => {
      channel.send("Someone left the voice chat");
    });
  }
};

const { redisClient } = require("../index");

const addUser = async (channelId, guildId, currentUsersId) => {
  try {
    const oldUsers = await redisClient.sMembers(`${guildId}:${channelId}`);
    const newUserId = currentUsersId.filter(userId => !oldUsers.includes(userId));
    await redisClient.sAdd(`${guildId}:${channelId}`, newUserId[0]);
    return newUserId[0];
  } catch (e) {
    // TODO: handle error
  }
};

module.exports.addUser = addUser;
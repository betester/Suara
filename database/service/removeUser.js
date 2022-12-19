const { redisClient } = require("../index");

const removeUser = async (channelId, guildId, currentUsersId) => {
  try {
    const oldUsers = await redisClient.sMembers(`${guildId}:${channelId}`);
    const newUserId = await redisClient.sDiff(oldUsers, currentUsersId);
    await redisClient.sRem(`${guildId}:${channelId}`, newUserId[0]);
    return newUserId[0];
  } catch (e) {
    // TODO: handle error
  }
};

module.exports.removeUser = removeUser;
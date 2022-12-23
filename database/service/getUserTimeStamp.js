const { redisClient } = require("../index");

const getUserTimeStamp = async (userId, channelId, guildId) => {
  try {
    return await redisClient.get(`j:${channelId}:${guildId}:${userId}`);
  } catch (e) {
    console.log(e);
  }
};

exports.getUserTimeStamp = getUserTimeStamp;

const { redisClient } = require("../index");

const getLastTimeStamp = async (userId, guildId, min, max) => {
  try {
    return await redisClient.zRangeWithScores(`${userId}:${guildId}`, min, max);
  } catch (e) {
    console.log(e);
  }
};

exports.getLastTimeStamp = getLastTimeStamp;

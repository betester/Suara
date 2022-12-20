const { redisClient } = require("../index");

const deleteLastTimeStamp = async (userId, guildId, min, max) => {
  try {
    return await redisClient.zRemRangeByRank(`${userId}:${guildId}`, min, max);
  } catch (e) {
    console.log(e);
  }
};

exports.deleteLastTimeStamp = deleteLastTimeStamp;

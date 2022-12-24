const { redisClient } = require("../index");

const saveUserTimeStamp = async (userId, guildId, channelId) => {
  try {
    const currentTime = Date.now();
    await redisClient.set(`j:${channelId}:${guildId}:${userId}`, currentTime);
  } catch (e) {
    // TODO: handle error
    console.log(e);
  }
};

exports.saveUserTimeStamp = saveUserTimeStamp;

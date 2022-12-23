const { redisClient } = require("../index");

const saveUserTimeStamp = async (userId, guildId, channelId,time) => {
  try {
    const currentTime = Date.now();
    await redisClient.set(`j:${channelId}:${guildId}:${userId}`, time ? time : currentTime);
  } catch (e) {
    // TODO: handle error
    console.log(e);
  }
};

exports.saveUserTimeStamp = saveUserTimeStamp;

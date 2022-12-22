const { redisClient } = require("../index");

const saveUserJoinTimeStamp = async (userId, guildId, channelId,status) => {
  try {
    const currentTime = Date.now();
    await redisClient.zAdd(`t:${userId}:${guildId}:${status}`, {
      score: currentTime,
      value: `${channelId}:${currentTime}`,
    });
  } catch (e) {
    // TODO: handle error
    console.log(e);
  }
};

exports.saveUserJoinTimeStamp = saveUserJoinTimeStamp;

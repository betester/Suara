const { redisClient } = require("../index");

const saveUserJoinTimeStamp = async (userId, guildId, channelId) => {
  try {
    const currentTime = Date.now();
    await redisClient.zAdd(`${userId}:${guildId}`, {
      score: currentTime,
      value: `${channelId}:${currentTime}`,
    });
  } catch (e) {
    // TODO: handle error
    console.log(e);
  }
};

exports.saveUserJoinTimeStamp = saveUserJoinTimeStamp;

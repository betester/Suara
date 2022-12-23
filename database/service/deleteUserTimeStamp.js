const { redisClient } = require("../index");

const deleteUserTimeStamp = async (userId, guildId, channelId) => {
  try {
    const timeStamp = await redisClient.get(
      `j:${channelId}:${guildId}:${userId}`
    );
    redisClient.del(`j:${channelId}:${guildId}:${userId}`);
    return Date.now() - timeStamp;
  } catch (e) {
    // TODO: handle error
    console.log(e);
  }
};

exports.deleteUserTimeStamp = deleteUserTimeStamp;

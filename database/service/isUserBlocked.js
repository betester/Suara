const { redisClient } = require("../index");

const isUserBlocked = async (userId, guildId) => {
  try {
    const response = await redisClient.get(`blocked:${userId}:${guildId}`);
    return response ? true : false;
  } catch (e) {
    console.log(e);
  }
};

exports.isUserBlocked = isUserBlocked;

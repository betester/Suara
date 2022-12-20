const { redisClient } = require("../index");

const saveUserJoinTimeStamp = async (userId, guildId,channelId, timeStamp) => {
    try {
        await redisClient.zAdd(`${userId}:${guildId}`,timeStamp,channelId);
    }

    catch (e) {
        // TODO: handle error
    }
}

exports.saveUserJoinTimeStamp = saveUserJoinTimeStamp;
// tambahin blocked key di server redis
// send blocked message to user yang diblokir selama durasinya

const { blockUser } = require("../../database/service/blockUser");
const { isUserBlocked } = require("../../database/service/isUserBlocked");
const { sendEmbeds } = require("./sendEmbeds");
const {
  deleteLastTimeStamp,
} = require("../../database/service/deleteLastTimeStamp");

const handleSpam = async (channel, userId, guildId) => {
  try {
    if (!(await isUserBlocked(userId, guildId))) {
      await blockUser(userId, guildId);
      deleteLastTimeStamp(userId,guildId,0,5);
      sendEmbeds(channel, userId, "blocked");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.handleSpam = handleSpam;

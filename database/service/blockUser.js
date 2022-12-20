// TODO:
// 1. dapatin userId dan guildId
// 2. simpan boolean blocked atau engga
// 3. untuk starter biar sederhana blokir 2 menit aja
// 4. nanti kalau udah bisa, 1,2,4,8,..., 64 (maks)
// 5. cooldown reset tiap 1 jam

const { redisClient } = require("../index");

const blockUser = async (userId, guildId) => {
  try {
    await redisClient.set(`blocked:${userId}:${guildId}`, "true");
    await redisClient.expire(`blocked:${userId}:${guildId}`, 120);
  } catch (e) {
    console.log(e);
  }
};

exports.blockUser = blockUser;

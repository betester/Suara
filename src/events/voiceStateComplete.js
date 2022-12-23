//  habis user join,
// 1.emit event voiceStateComplete
// 2.terima client, timeStamp, userId, guildId, sama abis ngapain (join,left,change voice chat)
// 3. simpan timestamp berdasarkan userId dan guildId-nya
// spam didefinisikan sebagai berikut
// versi 1
// cek 10 timestamp terakhir, kalau selisih masing" interval kurang dari 3 menit
// brarti dia ngespam
// problem dengan approach ini
// 1. user tinggal tunggu tiap 3 menit terus ngespam dalam interval 3 menit terus, tetap jengkelin
// versi 2
// make model machine learning, tapi problemnya datanya ga cukup
// adain tombol report spam supaya bisa belajar
// untuk sementara make versi 1 dulu

const { getLastTimeStamp } = require("../../database/service/getLastTimeStamp");
const {
  saveUserJoinTimeStamp,
} = require("../../database/service/saveUserJoinTimeStamp");
const { handleSpam } = require("../service/handleSpam");
const { isSpam } = require("../service/isSpam");

module.exports = async (client,channel,userId, guildId, channelId) => {
  await saveUserJoinTimeStamp(userId, guildId, channelId);
  const last10TimeStamp = await getLastTimeStamp(
    userId,
    guildId,
    0,
    10,
    "withscores"
  );
  if (isSpam(last10TimeStamp.map((value) => value.score)))
    handleSpam(channel,userId,guildId);
};

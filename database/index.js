const { createClient } = require("redis");
const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect().then(() => {
  console.log("dones");
});
exports.redisClient = client;

require("dotenv").config();
const { createClient } = require("redis");

const redis_url = process.env.REDIS_URL;
const redis_password = process.env.REDIS_PASSWORD;
const redis_username = process.env.REDIS_USERNAME;

const client = createClient({
  url: redis_url,
  password: redis_password,
  username: redis_username,
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect().then(() => {
  client.flushAll();
  client.watch("apa");
});
exports.redisClient = client;

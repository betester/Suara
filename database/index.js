const { createClient } = require("redis");

async function main() {
  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  exports.redisClient = client;
}

main();
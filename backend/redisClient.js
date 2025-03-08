const { createClient } = require("redis");

// Redis Client
const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis!");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
})();

module.exports = redisClient;
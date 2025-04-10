const redisClient = require("./redisClient"); // Import Redis connection

const rateLimiter = async (req, res, next) => {
  const userKey = `rate_limit:${req.ip}:${Math.floor(Date.now() / 60000)}`; // Unique key per minute
  const MAX_REQUESTS = 50;
  const EXPIRATION_TIME = 59;

  try {
    const currentCount = await redisClient.get(userKey);

    if (currentCount !== null && parseInt(currentCount) >= MAX_REQUESTS) {
      return res.status(429).json({ message: "Rate limit exceeded. Try again later." });
    }

    // Atomic increment and expiration using Redis transaction
    await redisClient
      .multi()
      .incr(userKey)
      .expire(userKey, EXPIRATION_TIME)
      .exec();

    next();
  } catch (error) {
    console.error("Redis rate limiting error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = rateLimiter;

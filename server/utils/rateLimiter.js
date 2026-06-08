import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

/**
 * Redis client
 */
export const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: 1, // prevent hanging requests
    enableReadyCheck: true,
  },
);

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

/**
 * Utility: check if Redis is usable
 */
const isRedisReady = () => redisClient.status === "ready";

/**
 * Utility: build Redis store safely
 */
const buildStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix,
  });

/**
 * Utility: common limiter factory
 */
const createLimiter = ({
  windowMs,
  max,
  prefix,
  message,
  useUserId = false,
}) => {
  return rateLimit({
    windowMs,
    max,

    // Smart key: userId if logged in, else IP
    keyGenerator: (req) => {
      if (useUserId && req.user?.id) {
        return `user:${req.user.id}`;
      }
      return req.ip;
    },

    // Skip limiter if Redis is down (fail-open)
    skip: () => !isRedisReady(),

    // Redis distributed store
    store: isRedisReady() ? buildStore(prefix) : undefined,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

/**
 * Global limiter (general APIs)
 */
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  prefix: "rl:global:",
  message: "Too many requests. Please try again later.",
});

/**
 * Auth limiter (login, reset, OTP)
 */
export const authLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  prefix: "rl:auth:",
  message: "Too many authentication attempts. Please try again after an hour.",
});

/**
 * Payment / sensitive actions limiter
 */
export const sensitiveLimiter = createLimiter({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 10,
  prefix: "rl:sensitive:",
  message: "Too many sensitive operations. Slow down.",
  useUserId: true, // per-user protection
});

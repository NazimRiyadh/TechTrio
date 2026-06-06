/**
 * config/index.js
 * Single source of truth for all environment configuration.
 * Import this instead of reading process.env directly in application code.
 */

const requireEnv = (key) => {
  const val = process.env[key];
  if (!val) {
    console.error(`[Config] Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return val;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 4000,
  frontendUrl: process.env.FRONTEND_URL,
  dashboardUrl: process.env.DASHBOARD_URL,

  jwt: {
    secret: requireEnv("JWT_SECRET_KEY"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    cookieExpiresIn: Number(process.env.COOKIE_EXPIRES_IN) || 7,
  },

  db: {
    connectionString: process.env.DATABASE_URL,
    user: process.env.DATABASE_URL ? process.env.DB_USER : requireEnv("DB_USER"),
    host: process.env.DATABASE_URL ? process.env.DB_HOST : requireEnv("DB_HOST"),
    port: Number(process.env.DB_PORT) || 5432,
    password: process.env.DATABASE_URL ? process.env.DB_PASSWORD : requireEnv("DB_PASSWORD"),
    database: process.env.DATABASE_URL ? process.env.DB_NAME : requireEnv("DB_NAME"),
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  cloudinary: {
    cloudName: requireEnv("CLOUDINARY_CLIENT_NAME"),
    apiKey: requireEnv("CLOUDINARY_CLIENT_API"),
    apiSecret: requireEnv("CLOUDINARY_CLIENT_SECRET"),
  },

  stripe: {
    secretKey: requireEnv("STRIPE_SECRET_KEY"),
    publishableKey: requireEnv("STRIPE_PUBLISHABLE_KEY"),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

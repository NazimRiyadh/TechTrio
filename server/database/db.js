import pkg from "pg";
import { config } from "../config/index.js";

const { Pool } = pkg;

const poolConfig = config.db.connectionString
  ? {
      connectionString: config.db.connectionString,
      ssl: config.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
    }
  : {
      user: config.db.user,
      host: config.db.host,
      port: config.db.port,
      password: config.db.password,
      database: config.db.database,
      ssl: config.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
    };

const db = new Pool(poolConfig);

try {
  const client = await db.connect();
  client.release();
  console.log("Connected to the database pool");
} catch (error) {
  console.log("Error connecting to the database pool", error);
  process.exit(1);
}

export default db;

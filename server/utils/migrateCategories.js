import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: parseInt(process.env.DB_PORT),
});

const migrate = async () => {
  try {
    console.log("🚀 Starting database category migration...");

    // Update categories
    await pool.query("UPDATE products SET category = 'Laptops & Desktops' WHERE category = 'Laptops'");
    await pool.query("UPDATE products SET category = 'Smartphones & Tablets' WHERE category = 'Smartphones'");
    await pool.query("UPDATE products SET category = 'Audio & Headphones' WHERE category = 'Audio'");
    await pool.query("UPDATE products SET category = 'Monitors & Displays' WHERE category = 'Monitors'");
    
    // Split accessories and gaming based on keywords
    await pool.query("UPDATE products SET category = 'Gadgets & Drones' WHERE name ILIKE '%mavic%' OR name ILIKE '%drone%'");
    await pool.query("UPDATE products SET category = 'Peripherals & Gaming' WHERE category = 'Gaming'");
    await pool.query("UPDATE products SET category = 'PC Components' WHERE category = 'Accessories' AND (name ILIKE '%ram%' OR name ILIKE '%ssd%' OR name ILIKE '%rtx%' OR name ILIKE '%graphics%' OR name ILIKE '%core%' OR name ILIKE '%ryzen%')");
    await pool.query("UPDATE products SET category = 'Peripherals & Gaming' WHERE category = 'Accessories' AND (name ILIKE '%keychron%' OR name ILIKE '%keyboard%' OR name ILIKE '%mouse%' OR name ILIKE '%controller%')");
    await pool.query("UPDATE products SET category = 'Gadgets & Drones' WHERE category = 'Accessories'");

    console.log("✅ Database category migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

migrate();

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

// Import db AFTER dotenv.config()
const { default: db } = await import("../database/db.js");

const products = [
  {
    name: "Asus ROG Zephyrus G14",
    description: "Compact and powerful gaming laptop with AMD Ryzen 9 and RTX 4070. Perfect for pros and creators.",
    price: 1599.99,
    category: "Laptops & Desktops",
    stock: 15,
    images: [
      { public_id: "zephyrus_g14", url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    name: "iPhone 15 Pro Max",
    description: "Titanium design, A17 Pro chip, and the most advanced camera system in an iPhone.",
    price: 1199.00,
    category: "Smartphones & Tablets",
    stock: 25,
    images: [
      { public_id: "iphone_15_pro", url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancellation and premium sound quality with 30-hour battery life.",
    price: 399.99,
    category: "Audio & Headphones",
    stock: 50,
    images: [
      { public_id: "sony_xm5", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    name: "Samsung Odyssey G9 49\"",
    description: "49-inch curved gaming monitor with Dual QHD resolution and 240Hz refresh rate.",
    price: 1299.99,
    category: "Monitors & Displays",
    stock: 10,
    images: [
      { public_id: "samsung_g9", url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    name: "DJI Mavic 3 Pro",
    description: "Triple-camera system for professional aerial photography and 43-minute flight time.",
    price: 2199.00,
    category: "Gadgets & Drones",
    stock: 5,
    images: [
      { public_id: "mavic_3_pro", url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    name: "Keychron Q6 Pro",
    description: "Full-size QMK/VIA wireless mechanical keyboard with aluminum body.",
    price: 199.00,
    category: "Peripherals & Gaming",
    stock: 30,
    images: [
      { public_id: "keychron_q6", url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80" }
    ]
  }
];

const seed = async () => {
  try {
    // 1. Get a user to assign as creator
    const userResult = await db.query("SELECT id FROM users LIMIT 1");
    if (userResult.rows.length === 0) {
      console.error("No users found. Please create a user first.");
      process.exit(1);
    }
    const creatorId = userResult.rows[0].id;

    // 2. Clear existing products (optional)
    await db.query("DELETE FROM products");

    // 3. Insert products
    for (const p of products) {
      await db.query(
        `INSERT INTO products (name, description, price, category, stock, images, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [p.name, p.description, p.price, p.category, p.stock, JSON.stringify(p.images), creatorId]
      );
      console.log(`Seeded: ${p.name}`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();

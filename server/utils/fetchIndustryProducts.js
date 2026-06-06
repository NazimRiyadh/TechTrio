import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const { default: db } = await import("../database/db.js");

const CATEGORY_SOURCES = [
  {
    url: "https://www.startech.com.bd/laptop-notebook/laptop",
    category: "Laptops & Desktops"
  },
  {
    url: "https://www.startech.com.bd/desktops",
    category: "Laptops & Desktops"
  },
  {
    url: "https://www.startech.com.bd/mobile-phone",
    category: "Smartphones & Tablets"
  },
  {
    url: "https://www.startech.com.bd/tablet-pc",
    category: "Smartphones & Tablets"
  },
  {
    url: "https://www.startech.com.bd/monitor",
    category: "Monitors & Displays"
  },
  {
    url: "https://www.startech.com.bd/component/graphics-card",
    category: "PC Components"
  },
  {
    url: "https://www.startech.com.bd/earphone",
    category: "Audio & Headphones"
  },
  {
    url: "https://www.startech.com.bd/gadget/smart-watch",
    category: "Gadgets & Drones"
  },
  {
    url: "https://www.startech.com.bd/accessories/keyboard",
    category: "Peripherals & Gaming"
  },
  {
    url: "https://www.startech.com.bd/accessories/mouse",
    category: "Peripherals & Gaming"
  }
];

const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `https://www.startech.com.bd${url}`;
  return `https://www.startech.com.bd/${url}`;
};

const runIngest = async () => {
  try {
    console.log("🔌 Connecting and preparing database context...");
    
    // Check if clear option is enabled
    const clearDb = process.argv.includes("--clear");
    if (clearDb) {
      console.log("🧹 Clearing all existing products from database...");
      await db.query("DELETE FROM products");
      console.log("✅ Existing products deleted successfully.");
    }

    // Get product creator user ID
    const userResult = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    let creatorId;
    if (userResult.rows.length > 0) {
      creatorId = userResult.rows[0].id;
    } else {
      const anyUserResult = await db.query("SELECT id FROM users LIMIT 1");
      if (anyUserResult.rows.length === 0) {
        console.error("❌ No users found in the database. Run seedAdmin.js first.");
        process.exit(1);
      }
      creatorId = anyUserResult.rows[0].id;
    }

    console.log(`👤 Using creator ID: ${creatorId}`);
    console.log("🚀 Starting scraping process...\n");

    let totalIngested = 0;
    let totalSkipped = 0;

    for (const source of CATEGORY_SOURCES) {
      console.log(`🌐 Crawling URL: ${source.url} &rarr; ${source.category}`);

      let html;
      try {
        const response = await axios.get(source.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
          },
          timeout: 10000
        });
        html = response.data;
      } catch (err) {
        console.error(`   ⚠️ Failed to load page ${source.url}: ${err.message}`);
        continue;
      }

      const $ = cheerio.load(html);
      const items = $(".p-item");

      if (items.length === 0) {
        console.log("   ⚠️ No items found on this page structure. Skipping.");
        continue;
      }

      console.log(`   📝 Found ${items.length} product elements. Extracting data...`);

      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        
        // Extract Title
        const name = $(el).find(".p-item-name a").text().trim();
        if (!name) {
          totalSkipped++;
          continue;
        }

        // Check for duplicates
        const exists = await db.query("SELECT id FROM products WHERE name = $1", [name]);
        if (exists.rows.length > 0) {
          totalSkipped++;
          continue;
        }

        // Extract description from bullet points or fallback to title
        let description = $(el)
          .find(".short-description ul li")
          .map((_, li) => $(li).text().trim())
          .get()
          .join("\n");
        
        if (!description) {
          description = `High quality product: ${name}`;
        }

        // Extract Price (cleaned to numeric float value)
        let priceText = $(el).find(".p-item-price .price-new").text().trim();
        if (!priceText) {
          priceText = $(el).find(".p-item-price span").text().trim();
        }

        let price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
        if (isNaN(price) || price <= 0) {
          // Fallback default price if missing/unpriced
          price = 45000.00;
        }

        // Extract Image
        const imgEl = $(el).find(".p-item-img img");
        const rawImgUrl = imgEl.attr("src") || imgEl.attr("data-src");
        const imgUrl = formatImageUrl(rawImgUrl);

        const images = [];
        if (imgUrl) {
          images.push({
            public_id: `scraped_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_0`,
            url: imgUrl
          });
        } else {
          // Skip if product has no image
          console.log(`   ⏭️ Skipped (no image): ${name}`);
          totalSkipped++;
          continue;
        }

        // Randomize Stock and Ratings
        const stock = Math.floor(Math.random() * 41) + 10; // 10 to 50
        const ratings = parseFloat((4.0 + Math.random()).toFixed(2)); // 4.00 to 5.00

        // Insert into DB
        await db.query(
          `INSERT INTO products (name, description, price, category, stock, images, ratings, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            name,
            description,
            price,
            source.category,
            stock,
            JSON.stringify(images),
            ratings,
            creatorId
          ]
        );

        totalIngested++;
      }
      
      console.log(`   ✅ Current progress: Ingested ${totalIngested} products total.\n`);
    }

    console.log("🎉 Scraping & Ingestion Completed Successfully!");
    console.log(`   ✅ Total Ingested: ${totalIngested}`);
    console.log(`   ⏭️ Total Skipped (Duplicate / No Image): ${totalSkipped}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error during crawling/ingestion:", err);
    process.exit(1);
  }
};

runIngest();

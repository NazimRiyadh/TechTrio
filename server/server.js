import { config } from "dotenv";

// Load env vars FIRST, before any other module
config({ path: "./config/config.env" });

const { default: app } = await import("./app.js");
const { v2: cloudinary } = await import("cloudinary");
const { createTable } = await import("./utils/createTable.js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Ensure tables exist before accepting connections
await createTable();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


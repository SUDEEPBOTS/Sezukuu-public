import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in .env");
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "yuki", // ✅ FIXED
    });
    console.log("🔥 MAIN DB Connected");
  } catch (err) {
    console.error("❌ DB ERROR:", err);
  }
}

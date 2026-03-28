import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[db] MONGODB_URI is not set. Running without database persistence.");
    return false;
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "dpdp_intelligence",
    });
    console.log("[db] MongoDB connected");
    return true;
  } catch (error) {
    console.warn(`[db] MongoDB connection failed: ${error.message}`);
    return false;
  }
}

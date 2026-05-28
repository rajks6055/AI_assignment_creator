import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Connect to Upstash (Make sure your URL in .env starts with rediss:// for security)
export const redisConnection = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on("error", (error) => {
  console.error("❌ Redis Connection Error:", error);
});

redisConnection.on("connect", () => {
  console.log("🔴 Redis Connected Successfully");
});
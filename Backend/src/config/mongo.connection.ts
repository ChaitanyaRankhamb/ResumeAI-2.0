import dotenv from "dotenv";
import mongoose from "mongoose";
import { AppError } from "../Error/appError";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("[MongoDB] MONGODB_URI is not defined in environment variables");
  throw new AppError(
    "MONGODB_URI is not defined in environment variables",
    500,
  );
}

// Cache connection (important for Next.js / Node apps)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing DB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(MONGO_URI);

    isConnected = conn.connections[0].readyState === 1;

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;

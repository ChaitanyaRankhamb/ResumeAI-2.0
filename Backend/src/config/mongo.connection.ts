import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppError } from "../Error/appError";

// choose which mongo db has to use. Atlas or image. 
dotenv.config({
  path: ".env",
});

const MONGO_URI = process.env.MONGODB_URI!;

if (!MONGO_URI) {
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

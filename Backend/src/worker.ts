import connectDB from "./config/mongo.connection";
import { connectMinio } from "./config/minio.connection";
import { redisConnection } from "./config/redis.connection";

const initializeWorker = async () => {
  // The worker runs in a separate process, so it must initialize its own
  // database and external service connections before handling jobs.
  await connectDB();
  await redisConnection();
  await connectMinio();

  await import("./queues/resume.worker");

  console.log("Resume Worker Started...");
};

void initializeWorker().catch((error: unknown) => {
  console.error("Resume worker startup failed:", error);
});
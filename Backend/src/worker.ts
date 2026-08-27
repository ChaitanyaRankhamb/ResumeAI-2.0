import connectDB from "./config/mongo.connection";
import { connectMinio } from "./config/minio.connection";
import { redisConnection } from "./config/redis.connection";

const initializeWorker = async () => {
  // The worker runs in a separate process, so it must initialize its own
  // database and external service connections before handling jobs.
  await connectDB();
  await redisConnection();
  await connectMinio();

  const { resumeWorker } = await import("./queues/resume-worker");

  console.log("Resume Worker Started...");

  // Graceful shutdown handling for SIGTERM and SIGINT signals (e.g. when Docker container stops/restarts)
  const shutdown = async (signal: string) => {
    console.log(`[resume-worker] Received ${signal}, closing worker gracefully...`);
    try {
      await resumeWorker.close();
      console.log("[resume-worker] Worker closed successfully.");
      process.exit(0);
    } catch (err) {
      console.error("[resume-worker] Error closing worker during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
};

void initializeWorker().catch((error: unknown) => {
  console.error("Resume worker startup failed:", error);
});
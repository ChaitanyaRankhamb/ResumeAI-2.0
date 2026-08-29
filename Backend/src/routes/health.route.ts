import express, { Request, Response } from "express";
import mongoose from "mongoose";
import logger from "../config/logger.config";
import minioClient from "../config/minio.connection";
import redisClient from "../config/redis.connection";

const router = express.Router();
const log = logger.child({ module: "HEALTH_CHECK" });

interface ServiceHealth {
  status: "up" | "down";
  latencyMs: number;
  message?: string;
}

/**
 * GET /health
 * Performs live health checks on MongoDB, Redis, and MinIO storage.
 * Returns HTTP 200 if all services are healthy, or HTTP 503 if any service is down.
 */
router.get("/", async (_req: Request, res: Response) => {
  const startTime = Date.now();

  // 1. Check MongoDB Health
  let mongoHealth: ServiceHealth = { status: "down", latencyMs: 0 };
  try {
    const mongoStart = Date.now();
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      mongoHealth = {
        status: "up",
        latencyMs: Date.now() - mongoStart,
      };
    } else {
      mongoHealth = {
        status: "down",
        latencyMs: Date.now() - mongoStart,
        message: `MongoDB readyState is ${mongoose.connection.readyState}`,
      };
    }
  } catch (err: any) {
    mongoHealth = {
      status: "down",
      latencyMs: 0,
      message: err.message,
    };
  }

  // 2. Check Redis Health
  let redisHealth: ServiceHealth = { status: "down", latencyMs: 0 };
  try {
    const redisStart = Date.now();
    const pong = await redisClient.ping();
    if (pong === "PONG") {
      redisHealth = {
        status: "up",
        latencyMs: Date.now() - redisStart,
      };
    } else {
      redisHealth = {
        status: "down",
        latencyMs: Date.now() - redisStart,
        message: `Unexpected Redis response: ${pong}`,
      };
    }
  } catch (err: any) {
    redisHealth = {
      status: "down",
      latencyMs: 0,
      message: err.message,
    };
  }

  // 3. Check MinIO Object Storage Health
  let minioHealth: ServiceHealth = { status: "down", latencyMs: 0 };
  try {
    const minioStart = Date.now();
    const bucketName = process.env.MINIO_BUCKET || "resumes";
    const exists = await minioClient.bucketExists(bucketName);
    minioHealth = {
      status: exists ? "up" : "down",
      latencyMs: Date.now() - minioStart,
      ...(exists ? {} : { message: `Bucket '${bucketName}' not found` }),
    };
  } catch (err: any) {
    minioHealth = {
      status: "down",
      latencyMs: 0,
      message: err.message,
    };
  }

  // Determine overall cluster health
  const isHealthy =
    mongoHealth.status === "up" &&
    redisHealth.status === "up" &&
    minioHealth.status === "up";

  const totalDurationMs = Date.now() - startTime;
  const memoryUsage = process.memoryUsage();

  const responsePayload = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    checkDurationMs: totalDurationMs,
    environment: process.env.NODE_ENV || "development",
    services: {
      mongodb: mongoHealth,
      redis: redisHealth,
      minio: minioHealth,
    },
    system: {
      memoryRssMb: parseFloat((memoryUsage.rss / 1024 / 1024).toFixed(2)),
      memoryHeapUsedMb: parseFloat((memoryUsage.heapUsed / 1024 / 1024).toFixed(2)),
    },
  };

  if (isHealthy) {
    log.debug(responsePayload, "Health check passed: All services UP");
    return res.status(200).json(responsePayload);
  } else {
    log.error(responsePayload, "Health check failed: One or more dependencies DOWN");
    return res.status(503).json(responsePayload);
  }
});

export default router;

import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";

export interface CustomRequest extends Request {
  id?: string;
  userId?: string;
  log?: typeof logger;
}

/**
 * HTTP Request Logger Middleware
 * Tracks request lifecycle, assigns a unique correlation requestId,
 * and logs method, route, statusCode, response time (latency), and client metadata.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = process.hrtime.bigint();

  // 1. Generate or forward unique correlation Request ID
  const reqId =
    (req.headers["x-request-id"] as string) || randomUUID();
  (req as CustomRequest).id = reqId;
  res.setHeader("X-Request-Id", reqId);

  // 2. Attach scoped child logger to request object
  const scopedLogger = logger.child({
    reqId,
    method: req.method,
    url: req.originalUrl || req.url,
  });
  (req as CustomRequest).log = scopedLogger;

  // 3. Capture response metrics when request completes
  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    const statusCode = res.statusCode;
    const fullRoute = req.baseUrl ? `${req.baseUrl}${req.path}` : req.originalUrl || req.url;

    const logPayload = {
      reqId,
      method: req.method,
      route: fullRoute,
      statusCode,
      responseTime: `${durationMs.toFixed(2)}ms`,
      durationMs: parseFloat(durationMs.toFixed(2)),
      ip: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      ...( (req as CustomRequest).userId ? { userId: (req as CustomRequest).userId } : {} ),
    };

    const message = `HTTP ${req.method} ${fullRoute} ${statusCode} in ${logPayload.responseTime}`;

    if (statusCode >= 500) {
      scopedLogger.error(logPayload, message);
    } else if (statusCode >= 400) {
      scopedLogger.warn(logPayload, message);
    } else {
      scopedLogger.info(logPayload, message);
    }
  });

  next();
};

export default requestLogger;

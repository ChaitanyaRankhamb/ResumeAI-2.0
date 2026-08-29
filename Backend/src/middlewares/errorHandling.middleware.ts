import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";
import { AppError } from "../Error/appError";
import { CustomRequest } from "./requestLogger.middleware";

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const customReq = req as CustomRequest;
  const reqId = customReq.id || (req.headers["x-request-id"] as string) || "unknown";
  const log = customReq.log || logger.child({ module: "ERROR_HANDLER", reqId });

  let statusCode: number = 500;
  let message: string = "Internal Server Error";

  // If it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // fallback for unexpected exceptions
    message = err.message || message;
  }

  const logContext = {
    reqId,
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode,
    userId: customReq.userId,
    ip: req.ip || req.socket.remoteAddress,
  };

  if (statusCode >= 500) {
    log.error(
      {
        ...logContext,
        err,
        stack: err.stack,
      },
      `Unhandled Server Exception (HTTP 500): ${message}`,
    );
  } else if (statusCode >= 400) {
    log.warn(
      {
        ...logContext,
        message,
      },
      `Client Application Error (HTTP ${statusCode}): ${message}`,
    );
  }

  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? "Internal Server Error" : "Bad Request",
    message,
    reqId,
    ...(process.env.NODE_ENV !== "production" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
};

export default errorHandler;

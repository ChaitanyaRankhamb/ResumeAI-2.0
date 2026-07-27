import { NextFunction, Request, Response } from "express";
import { AppError } from "../Error/appError";

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode: number = 500;
  let message: string = "Internal Server Error";

  // If it's our custom error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // fallback for unknown errors
    message = err.message || message;
  }

  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

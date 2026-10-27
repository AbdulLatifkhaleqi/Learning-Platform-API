import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

import { AppError } from "../utils/AppError.js";

export const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
): void => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof mongoose.Error.ValidationError) {
    appError = new AppError("Database validation failed", 400);
  } else if (error instanceof mongoose.Error.CastError) {
    appError = new AppError("Invalid resource identifier", 400);
  } else if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    appError = new AppError("A resource with this value already exists", 409);
  } else {
    console.error(error);
    appError = new AppError("Internal server error", 500);
  }

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
  });
};

import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  let appError = error;

  if (error instanceof mongoose.Error.ValidationError) {
    appError = new AppError(error.message, 400);
  } else if (error instanceof mongoose.Error.CastError) {
    appError = new AppError("Invalid resource ID", 400);
  } else if (
    error instanceof Error &&
    "code" in error &&
    error.code === 11000
  ) {
    appError = new AppError("Duplicate field value", 409);
  } else if (!(error instanceof AppError)) {
    appError = new AppError("Internal server error", 500);
  }

  const statusCode = appError instanceof AppError ? appError.statusCode : 500;

  const message =
    appError instanceof AppError ? appError.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? "error" : "fail",
    message,
  });
};

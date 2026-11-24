import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError.js";
import { getEnrollmentAnalytics } from "./enrollment-analytics.service.js";

export const getEnrollmentAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, period } = req.params;
    const auth = res.locals.auth;

    if (typeof courseId !== "string") {
      throw new AppError("Invalid course ID", 400);
    }

    if (period !== "day" && period !== "month") {
      throw new AppError("Period must be day or month", 400);
    }

    const analytics = await getEnrollmentAnalytics(courseId, period, {
      userId: auth.userId,
      role: auth.role,
    });

    return res.status(200).json({
      success: true,
      data: analytics,
      message: "Enrollment analytics retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

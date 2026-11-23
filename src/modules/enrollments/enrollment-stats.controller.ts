import type { Request, Response, NextFunction } from "express";
import { getEnrollmentStats } from "./enrollment-stats.service.js";
import { AppError } from "../../utils/AppError.js";

export const getEnrollmentStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = res.locals.auth;

    const { courseId } = req.params;

    if (typeof courseId !== "string") {
      throw new AppError("Invalid course ID", 400);
    }

    const stats = await getEnrollmentStats(courseId, {
      userId: auth.userId,
      role: auth.role,
    });

    return res.status(200).json({
      success: true,
      data: stats,
      message: "Enrollment statistics retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

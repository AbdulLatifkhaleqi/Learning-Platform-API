import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../utils/AppError.js";
import { getEnrollmentDashboard } from "./enrollment-dashboard.service.js";

export const getEnrollmentDashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    if (typeof courseId !== "string") {
      throw new AppError("Invalid course ID", 400);
    }

    const auth = res.locals.auth;

    const dashboard = await getEnrollmentDashboard(courseId, {
      userId: auth.userId,
      role: auth.role,
    });

    return res.status(200).json({
      success: true,
      data: dashboard,
      message: "Enrollment dashboard retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

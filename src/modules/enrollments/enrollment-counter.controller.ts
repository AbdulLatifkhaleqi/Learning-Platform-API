import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError.js";
import { reconcileEnrollmentCount } from "./enrollment-counter.service.js";

export const reconcileEnrollmentCountController = async (
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

    if (auth.role !== "admin") {
      throw new AppError(
        "Only administrators can reconcile enrollment counts",
        403,
      );
    }

    const result = await reconcileEnrollmentCount(courseId);

    return res.status(200).json({
      success: true,
      data: result,
      message: "Enrollment count reconciled successfully",
    });
  } catch (error) {
    next(error);
  }
};

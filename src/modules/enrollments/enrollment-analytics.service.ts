import { Types } from "mongoose";
import { Enrollment } from "./enrollment.model.js";
import { Course } from "../courses/course.model.js";
import { assertValidId } from "../../utils/assert-valida-id.js";
import { AppError } from "../../utils/AppError.js";
import type { EnrollmentAnalyticsQuery } from "./enrollment-analytics.validation.js";

type AnalyticsPeriod = "day" | "month";

export const getEnrollmentAnalytics = async (
  courseId: string,
  period: AnalyticsPeriod,
  query: EnrollmentAnalyticsQuery,
  requester: {
    userId: string;
    role: "student" | "teacher" | "admin";
  },
) => {
  assertValidId(courseId, "course");
  assertValidId(requester.userId, "requester");

  if (requester.role !== "admin" && requester.role !== "teacher") {
    throw new AppError("You are not allowed to view enrollment analytics", 403);
  }

  const courseFilter: Record<string, unknown> = {
    _id: new Types.ObjectId(courseId),
  };

  if (requester.role === "teacher") {
    courseFilter.instructor = new Types.ObjectId(requester.userId);
  }

  const courseExists = await Course.exists(courseFilter);

  if (!courseExists) {
    throw new AppError("Course not found or access denied", 404);
  }

  const dateFormat = period === "day" ? "%Y-%m-%d" : "%Y-%m";

  const analytics = await Enrollment.aggregate([
    {
      $match: {
        course: new Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: "$enrolledAt",
            timezone: "UTC",
          },
        },
        enrollments: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        period: "$_id",
        enrollments: 1,
      },
    },
  ]);

  return {
    courseId,
    period,
    timezone: "UTC",
    analytics,
  };
};

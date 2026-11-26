import { Types } from "mongoose";

import { Enrollment } from "./enrollment.model.js";
import { Course } from "../courses/course.model.js";
import { assertValidId } from "../../utils/assert-valida-id.js";
import { AppError } from "../../utils/AppError.js";

export const getEnrollmentDashboard = async (
  courseId: string,
  requester: {
    userId: string;
    role: "student" | "teacher" | "admin";
  },
) => {
  assertValidId(courseId, "course");
  assertValidId(requester.userId, "requester");

  if (requester.role !== "admin" && requester.role !== "teacher") {
    throw new AppError("You are not allowed to view this dashboard", 403);
  }

  const courseFilter: Record<string, unknown> = {
    _id: new Types.ObjectId(courseId),
  };

  if (requester.role === "teacher") {
    courseFilter.instructor = new Types.ObjectId(requester.userId);
  }

  const course = await Course.findOne(courseFilter)
    .select("_id title enrollmentCount")
    .lean()
    .exec();

  if (!course) {
    throw new AppError("Course not found or access denied", 404);
  }

  const [result] = await Enrollment.aggregate([
    {
      $match: {
        course: course._id,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const stats = result ?? {
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };

  const completionRate =
    stats.total > 0
      ? Number(((stats.completed / stats.total) * 100).toFixed(2))
      : 0;

  const cancellationRate =
    stats.total > 0
      ? Number(((stats.cancelled / stats.total) * 100).toFixed(2))
      : 0;

  return {
    course: {
      id: course._id.toString(),
      title: course.title,
    },
    enrollmentCount: course.enrollmentCount,
    statistics: {
      total: stats.total,
      active: stats.active,
      completed: stats.completed,
      cancelled: stats.cancelled,
      completionRate,
      cancellationRate,
    },
  };
};

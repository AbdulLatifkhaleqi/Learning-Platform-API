import { Types } from "mongoose";
import { Enrollment } from "./enrollment.model.js";
import { AppError } from "../../utils/AppError.js";
import { Course } from "../courses/course.model.js";
import { assertValidId } from "../../utils/assert-valida-id.js";

export const getEnrollmentStats = async (
  courseId: string,
  requester: {
    userId: string;
    role: "student" | "teacher" | "admin";
  },
) => {
  assertValidId(courseId, "course");
  assertValidId(requester.userId, "requester");

  if (requester.role !== "admin" && requester.role !== "teacher") {
    throw new AppError(
      "You are not allowed to view course enrollment statistics",
      403,
    );
  }

  const match: Record<string, unknown> = {
    course: new Types.ObjectId(courseId),
  };

  if (requester.role === "teacher") {
    const course = await Course.findOne({
      _id: new Types.ObjectId(courseId),
      instructor: new Types.ObjectId(requester.userId),
    })
      .select("_id")
      .lean()
      .exec();

    if (!course) {
      throw new AppError("Course not found or access denied", 404);
    }
  }

  const [stats] = await Enrollment.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    active: 0,
    completed: 0,
    cancelled: 0,
  };

  // Aggregate returns only statuses that have records.
  const results = await Enrollment.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  for (const result of results) {
    if (result._id in counts) {
      counts[result._id as keyof typeof counts] = result.count;
    }
  }

  return {
    courseId,
    total: Object.values(counts).reduce((total, count) => total + count, 0),
    ...counts,
  };
};

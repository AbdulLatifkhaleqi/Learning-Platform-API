import mongoose, { Types } from "mongoose";

import { assertValidId } from "../../utils/assert-valida-id.js";
import { Course } from "../courses/course.model.js";
import { Enrollment } from "./enrollment.model.js";
import { AppError } from "../../utils/AppError.js";

export const reconcileEnrollmentCount = async (courseId: string) => {
  assertValidId(courseId, "course");

  const objectId = new Types.ObjectId(courseId);
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const course = await Course.findById(objectId)
        .select("_id title")
        .session(session)
        .lean()
        .exec();

      if (!course) {
        throw new AppError("Course not found", 404);
      }

      const actualCount = await Enrollment.countDocuments({
        course: objectId,
      }).session(session);

      const updatedCourse = await Course.findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            enrollmentCount: actualCount,
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      )
        .select("_id title enrollmentCount")
        .lean()
        .exec();

      if (!updatedCourse) {
        throw new AppError("Course not found", 404);
      }

      return {
        courseId: updatedCourse._id.toString(),
        enrollmentCount: updatedCourse.enrollmentCount,
        actualCount,
        synchronized: updatedCourse.enrollmentCount === actualCount,
      };
    });

    if (!result) {
      throw new AppError("Could not reconcile enrollment count", 500);
    }

    return result;
  } finally {
    await session.endSession();
  }
};

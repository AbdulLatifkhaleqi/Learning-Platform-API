import { Types } from "mongoose";

import { assertValidId } from "../../utils/assert-valida-id.js";
import { Enrollment } from "./enrollment.model.js";
import { Course } from "../courses/course.model.js";
import { AppError } from "../../utils/AppError.js";

export const reconcileEnrollmentCount = async (courseId: string) => {
  assertValidId(courseId, "course");

  const objectId = new Types.ObjectId(courseId);

  const actualCount = await Enrollment.countDocuments({
    course: objectId,
  });

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
};

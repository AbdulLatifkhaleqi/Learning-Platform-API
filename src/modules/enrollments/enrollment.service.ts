import { Types } from "mongoose";

import { Enrollment } from "./enrollment.model.js";
import { Course } from "../courses/course.model.js";
import { AppError } from "../../utils/AppError.js";

import type {
  CreateEnrollmentInput,
  ListEnrollmentsInput,
  UpdateEnrollmentInput,
} from "./enrollment.types.js";

const assertValidId = (id: string, resource: string): void => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new AppError(`Invalid ${resource} ID`, 400);
  }
};

export const createEnrollment = async (
  input: CreateEnrollmentInput,
  studentId: string,
) => {
  assertValidId(studentId, "student");
  assertValidId(input.courseId, "course");

  const course = await Course.findById(input.courseId)
    .select("_id status")
    .lean()
    .exec();

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== "published") {
    throw new AppError("Only published courses can be enrolled in", 400);
  }

  const existingEnrollment = await Enrollment.findOne({
    student: new Types.ObjectId(studentId),
    course: new Types.ObjectId(input.courseId),
  })
    .select("_id")
    .lean()
    .exec();

  if (existingEnrollment) {
    throw new AppError("You are already enrolled in this course", 409);
  }

  try {
    return await Enrollment.create({
      student: new Types.ObjectId(studentId),
      course: new Types.ObjectId(input.courseId),
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AppError("You are already enrolled in this course", 409);
    }

    throw error;
  }
};

export const getAllEnrollments = async (input: ListEnrollmentsInput) => {
  const { page, limit, studentId, courseId, status, sortOrder } = input;

  const filter: Record<string, unknown> = {};

  if (studentId !== undefined) {
    assertValidId(studentId, "student");
    filter.student = new Types.ObjectId(studentId);
  }

  if (courseId !== undefined) {
    assertValidId(courseId, "course");
    filter.course = new Types.ObjectId(courseId);
  }

  if (status !== undefined) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const direction: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("student", "name email")
      .populate("course", "title price level status")
      .sort({ createdAt: direction, _id: direction })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),

    Enrollment.countDocuments(filter).exec(),
  ]);

  return {
    enrollments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getEnrollmentById = async (enrollmentId: string) => {
  assertValidId(enrollmentId, "enrollment");

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate("student", "name email")
    .populate("course", "title price level status")
    .lean()
    .exec();

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  return enrollment;
};

export const updateEnrollment = async (
  enrollmentId: string,
  input: UpdateEnrollmentInput,
) => {
  assertValidId(enrollmentId, "enrollment");

  const enrollment = await Enrollment.findById(enrollmentId)
    .select("status")
    .lean()
    .exec();

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  if (enrollment.status !== "active") {
    throw new AppError("Only active enrollments can change status", 409);
  }

  const now = new Date();

  const update: Record<string, unknown> = {
    status: input.status,
  };

  if (input.status === "completed") {
    update.completedAt = now;
    update.cancelledAt = null;
  } else if (input.status === "cancelled") {
    update.cancelledAt = now;
    update.completedAt = null;
  }

  const updatedEnrollment = await Enrollment.findOneAndUpdate(
    {
      _id: new Types.ObjectId(enrollmentId),
      status: "active",
    },
    { $set: update },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("student", "name email")
    .populate("course", "title price level status")
    .lean()
    .exec();

  if (!updatedEnrollment) {
    throw new AppError("Enrollment status has already changed", 409);
  }

  return updatedEnrollment;
};

export const deleteEnrollment = async (
  enrollmentId: string,
): Promise<void> => {
  assertValidId(enrollmentId, "enrollment");

  const enrollment = await Enrollment.findById(enrollmentId)
    .select("status")
    .lean()
    .exec();

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  if (enrollment.status === "completed") {
    throw new AppError(
      "Completed enrollments cannot be deleted",
      409,
    );
  }

  const deletedEnrollment = await Enrollment.findOneAndDelete({
    _id: new Types.ObjectId(enrollmentId),
    status: { $ne: "completed" },
  })
    .select("_id")
    .exec();

  if (!deletedEnrollment) {
    throw new AppError(
      "Enrollment could not be deleted because its status changed",
      409,
    );
  }
};
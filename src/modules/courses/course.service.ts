import { Types } from "mongoose";

import { Enrollment } from "../enrollments/enrollment.model.js";
import { Course } from "./course.model.js";
import { AppError } from "../../utils/AppError.js";

import type {
  CreateCourseInput,
  ListCoursesInput,
  UpdateCourseInput,
} from "./course.types.js";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id: string, resource: string): void => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new AppError(`Invalid ${resource} ID`, 400);
  }
};

export const createCourse = async (
  input: CreateCourseInput,
  instructorId: string,
) => {
  assertValidId(instructorId, "instructor");

  return Course.create({
    title: input.title,
    description: input.description,
    price: input.price,
    level: input.level,
    instructor: new Types.ObjectId(instructorId),
  });
};

export const getAllCourses = async (input: ListCoursesInput) => {
  const {
    page,
    limit,
    search,
    level,
    status,
    instructorId,
    sortBy,
    sortOrder,
  } = input;

  const filter: Record<string, unknown> = {};

  if (level !== undefined) filter.level = level;
  if (status !== undefined) filter.status = status;

  if (instructorId !== undefined) {
    assertValidId(instructorId, "instructor");
    filter.instructor = new Types.ObjectId(instructorId);
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  const skip = (page - 1) * limit;
  const direction: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "name email")
      .sort({ [sortBy]: direction, _id: direction })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Course.countDocuments(filter).exec(),
  ]);

  return {
    courses,
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

export const getCourseById = async (courseId: string) => {
  assertValidId(courseId, "course");

  const course = await Course.findById(new Types.ObjectId(courseId))
    .populate("instructor", "name email")
    .lean()
    .exec();

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

export const updateCourse = async (
  courseId: string,
  input: UpdateCourseInput,
  requester: {
    userId: string;
    role: "student" | "teacher" | "admin";
  },
) => {
  assertValidId(courseId, "course");
  assertValidId(requester.userId, "requester");

  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(courseId),
  };

  if (requester.role === "teacher") {
    filter.instructor = new Types.ObjectId(requester.userId);
  } else if (requester.role !== "admin") {
    throw new AppError("Insufficient permissions", 403);
  }

  const updatedCourse = await Course.findOneAndUpdate(
    filter,
    {
      $set: input,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("instructor", "name email")
    .lean()
    .exec();

  if (!updatedCourse) {
    throw new AppError(
      "Course not found or you do not have permission to update it",
      404,
    );
  }

  return updatedCourse;
};

export const deleteCourse = async (
  courseId: string,
  requester: {
    userId: string;
    role: "student" | "teacher" | "admin";
  },
): Promise<void> => {
  assertValidId(courseId, "course");
  assertValidId(requester.userId, "requester");

  if (requester.role !== "teacher" && requester.role !== "admin") {
    throw new AppError("Insufficient permissions", 403);
  }

  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(courseId),
  };

  if (requester.role === "teacher") {
    filter.instructor = new Types.ObjectId(requester.userId);
  }

  const course = await Course.findOne(filter)
    .select("_id status")
    .lean()
    .exec();

  if (!course) {
    throw new AppError(
      "Course not found or you do not have permission to delete it",
      404,
    );
  }

  const hasEnrollments = await Enrollment.exists({
    course: course._id,
  });

  if (hasEnrollments) {
    throw new AppError(
      "This course has enrollment records and cannot be deleted. Archive it instead.",
      409,
    );
  }

  const deletedCourse = await Course.findOneAndDelete({
    ...filter,
    status: course.status,
  })
    .select("_id")
    .lean()
    .exec();

  if (!deletedCourse) {
    throw new AppError(
      "Course could not be deleted because its state changed",
      409,
    );
  }
};

export const archiveCourse = async (
  courseId: string,
  requester: {
    userId: string;
    role: "student" | "teacher" | "admin";
  },
) => {
  assertValidId(courseId, "course");
  assertValidId(requester.userId, "requester");

  if (requester.role !== "teacher" && requester.role !== "admin") {
    throw new AppError("Insufficient permissions", 403);
  }

  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(courseId),
    status: { $ne: "archived" },
  };

  if (requester.role === "teacher") {
    filter.instructor = new Types.ObjectId(requester.userId);
  }

  const course = await Course.findOneAndUpdate(
    filter,
    {
      $set: {
        status: "archived",
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("instructor", "name email")
    .lean()
    .exec();

  if (!course) {
    throw new AppError(
      "Course not found, already archived, or you lack permission",
      409,
    );
  }

  return course;
};

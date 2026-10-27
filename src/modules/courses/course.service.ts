import { Types } from "mongoose";

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
) => {
  assertValidId(courseId, "course");

  const update: Record<string, string | number> = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.price !== undefined) update.price = input.price;
  if (input.level !== undefined) update.level = input.level;
  if (input.status !== undefined) update.status = input.status;

  const course = await Course.findByIdAndUpdate(
    new Types.ObjectId(courseId),
    { $set: update },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("instructor", "name email")
    .lean()
    .exec();

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  assertValidId(courseId, "course");

  const course = await Course.findByIdAndDelete(
    new Types.ObjectId(courseId),
  ).exec();

  if (!course) {
    throw new AppError("Course not found", 404);
  }
};

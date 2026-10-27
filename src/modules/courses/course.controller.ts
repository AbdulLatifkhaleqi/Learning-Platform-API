import type { RequestHandler } from "express";

import * as courseService from "./course.service.js";

import type {
  CreateCourseBody,
  CourseIdParams,
  ListCoursesQuery,
  UpdateCourseBody,
} from "./course.validation.js";

export const createCourse: RequestHandler = async (_req, res, next) => {
  try {
    const input = res.locals.validatedBody as CreateCourseBody;
    const instructorId = res.locals.auth?.userId as string;

    const course = await courseService.createCourse(input, instructorId);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCourses: RequestHandler = async (_req, res, next) => {
  try {
    const query = res.locals.validatedQuery as ListCoursesQuery;

    const result = await courseService.getAllCourses(query);

    res.status(200).json({
      success: true,
      data: result.courses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as CourseIdParams;

    const course = await courseService.getCourseById(id);

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as CourseIdParams;
    const input = res.locals.validatedBody as UpdateCourseBody;

    const course = await courseService.updateCourse(id, input);

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as CourseIdParams;

    await courseService.deleteCourse(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

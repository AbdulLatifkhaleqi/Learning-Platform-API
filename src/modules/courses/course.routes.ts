import { Router } from "express";

import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "./course.controller.js";

import { validate } from "./course.middleware.js";
import { authenticate } from "../auth/auth.middleware.js";

import {
  createCourseSchema,
  courseIdParamsSchema,
  listCoursesQuerySchema,
  updateCourseSchema,
} from "./course.validation.js";

const courseRoutes = Router();

//////////////////////////////////////////
///////// Public routes
courseRoutes.get("/", validate(listCoursesQuerySchema, "query"), getAllCourses);

courseRoutes.get(
  "/:id",
  validate(courseIdParamsSchema, "params"),
  getCourseById,
);

// Authenticated routes
courseRoutes.post(
  "/",
  authenticate,
  validate(createCourseSchema, "body"),
  createCourse,
);

courseRoutes.patch(
  "/:id",
  authenticate,
  validate(courseIdParamsSchema, "params"),
  validate(updateCourseSchema, "body"),
  updateCourse,
);

courseRoutes.delete(
  "/:id",
  authenticate,
  validate(courseIdParamsSchema, "params"),
  deleteCourse,
);

export default courseRoutes;

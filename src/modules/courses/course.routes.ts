// src/modules/courses/course.routes.ts

import { Router } from "express";

import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "./course.controller.js";

import { validate } from "./course.middleware.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";

import {
  createCourseSchema,
  courseIdParamsSchema,
  listCoursesQuerySchema,
  updateCourseSchema,
} from "./course.validation.js";

const courseRoutes = Router();

// Public routes
courseRoutes.get("/", validate(listCoursesQuerySchema, "query"), getAllCourses);

courseRoutes.get(
  "/:id",
  validate(courseIdParamsSchema, "params"),
  getCourseById,
);

// Teachers and admins can create courses.
courseRoutes.post(
  "/",
  authenticate,
  requireRole("teacher", "admin"),
  validate(createCourseSchema, "body"),
  createCourse,
);

// Teachers and admins can request updates.
// Ownership checks must also be enforced in the service.
courseRoutes.patch(
  "/:id",
  authenticate,
  requireRole("teacher", "admin"),
  validate(courseIdParamsSchema, "params"),
  validate(updateCourseSchema, "body"),
  updateCourse,
);

// Teachers and admins can request deletion.
// Ownership checks must also be enforced in the service.
courseRoutes.delete(
  "/:id",
  authenticate,
  requireRole("teacher", "admin"),
  validate(courseIdParamsSchema, "params"),
  deleteCourse,
);

export default courseRoutes;

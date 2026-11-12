import { Router } from "express";

import {
  archiveCourse,
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  publishCourse,
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

courseRoutes.get("/", validate(listCoursesQuerySchema, "query"), getAllCourses);

courseRoutes.get(
  "/:id",
  validate(courseIdParamsSchema, "params"),
  getCourseById,
);

courseRoutes.patch(
  "/:id/publish",
  authenticate,
  requireRole("teacher", "admin"),
  validate(courseIdParamsSchema, "params"),
  publishCourse,
);

courseRoutes.get(
  "/my-courses",
  authenticate,
  requireRole("teacher", "admin"),
  validate(listCoursesQuerySchema, "query"),
  getMyCourses,
);

courseRoutes.patch(
  "/:id/archive",
  authenticate,
  requireRole("teacher", "admin"),
  validate(courseIdParamsSchema, "params"),
  archiveCourse,
);

courseRoutes.post(
  "/",
  authenticate,
  requireRole("teacher", "admin"),
  validate(createCourseSchema, "body"),
  createCourse,
);

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

import { Router } from "express";

import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "./course.controller.js";

import { validate } from "./course.middleware.js";

import {
  createCourseSchema,
  courseIdParamsSchema,
  listCoursesQuerySchema,
  updateCourseSchema,
} from "./course.validation.js";

const courseRoutes = Router();

courseRoutes
  .route("/")
  .post(validate(createCourseSchema, "body"), createCourse)
  .get(validate(listCoursesQuerySchema, "query"), getAllCourses);

courseRoutes
  .route("/:id")
  .get(validate(courseIdParamsSchema, "params"), getCourseById)
  .patch(
    validate(courseIdParamsSchema, "params"),
    validate(updateCourseSchema, "body"),
    updateCourse,
  )
  .delete(validate(courseIdParamsSchema, "params"), deleteCourse);

export default courseRoutes;

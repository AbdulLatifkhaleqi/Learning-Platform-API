// src/modules/enrollments/enrollment.routes.ts

import { Router } from "express";

import {
  createEnrollment,
  deleteEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
} from "./enrollment.controller.js";

import { validate } from "./enrollment.middleware.js";

import {
  createEnrollmentSchema,
  enrollmentIdParamsSchema,
  listEnrollmentsQuerySchema,
  updateEnrollmentSchema,
} from "./enrollment.validation.js";

const enrollmentRoutes = Router();

enrollmentRoutes
  .route("/")
  .post(validate(createEnrollmentSchema, "body"), createEnrollment)
  .get(validate(listEnrollmentsQuerySchema, "query"), getAllEnrollments);

enrollmentRoutes
  .route("/:id")
  .get(validate(enrollmentIdParamsSchema, "params"), getEnrollmentById)
  .patch(
    validate(enrollmentIdParamsSchema, "params"),
    validate(updateEnrollmentSchema, "body"),
    updateEnrollment,
  )
  .delete(validate(enrollmentIdParamsSchema, "params"), deleteEnrollment);

export default enrollmentRoutes;

import { Router } from "express";

import {
  createEnrollment,
  deleteEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
} from "./enrollment.controller.js";

import { authenticate } from "../auth/auth.middleware.js";
import { validate } from "./enrollment.middleware.js";

import {
  createEnrollmentSchema,
  enrollmentIdParamsSchema,
  listEnrollmentsQuerySchema,
  updateEnrollmentSchema,
} from "./enrollment.validation.js";

import { getEnrollmentStatsController } from "./enrollment-stats.controller.js";
import { getEnrollmentAnalyticsController } from "./enrollment-analytics.controller.js";
import { enrollmentAnalyticsQuerySchema } from "./enrollment-analytics.validation.js";
import { getEnrollmentDashboardController } from "./enrollment-dashboard.controller.js";

const enrollmentRoutes = Router();
enrollmentRoutes.use(authenticate);

enrollmentRoutes.get(
  "/courses/:courseId/dashboard",
  authenticate,
  getEnrollmentDashboardController,
);

enrollmentRoutes.get(
  "/courses/:courseId/stats",
  authenticate,
  getEnrollmentStatsController,
);

enrollmentRoutes.get(
  "/courses/:courseId/analytics/:period",
  authenticate,
  validate(enrollmentAnalyticsQuerySchema, "query"),
  getEnrollmentAnalyticsController,
);

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

import { z } from "zod";

import { ENROLLMENT_STATUSES } from "./enrollment.types.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const enrollmentIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const createEnrollmentSchema = z
  .object({
    courseId: objectIdSchema,
  })
  .strict();

export const updateEnrollmentSchema = z
  .object({
    status: z.enum(ENROLLMENT_STATUSES),
  })
  .strict();

export const listEnrollmentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    studentId: objectIdSchema.optional(),

    courseId: objectIdSchema.optional(),

    status: z.enum(ENROLLMENT_STATUSES).optional(),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type CreateEnrollmentBody = z.infer<typeof createEnrollmentSchema>;

export type UpdateEnrollmentBody = z.infer<typeof updateEnrollmentSchema>;

export type EnrollmentIdParams = z.infer<typeof enrollmentIdParamsSchema>;

export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;

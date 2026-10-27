import { z } from "zod";

import { COURSE_LEVELS, COURSE_STATUSES } from "./course.types.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const titleSchema = z
  .string()
  .trim()
  .min(3, "Title must contain at least 3 characters")
  .max(150, "Title cannot exceed 150 characters");

const descriptionSchema = z
  .string()
  .trim()
  .min(20, "Description must contain at least 20 characters")
  .max(5000, "Description cannot exceed 5000 characters");

const priceSchema = z
  .number()
  .finite()
  .min(0, "Price cannot be negative")
  .max(1_000_000, "Price cannot exceed 1,000,000");

export const courseIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const createCourseSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    price: priceSchema,
    level: z.enum(COURSE_LEVELS),
  })
  .strict();

export const updateCourseSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    price: priceSchema.optional(),
    level: z.enum(COURSE_LEVELS).optional(),
    status: z.enum(COURSE_STATUSES).optional(),
  })
  .strict()
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    {
      message: "At least one field must be provided",
    },
  );

export const listCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    search: z.string().trim().min(1).max(150).optional(),

    level: z.enum(COURSE_LEVELS).optional(),
    status: z.enum(COURSE_STATUSES).optional(),

    instructorId: objectIdSchema.optional(),

    sortBy: z.enum(["createdAt", "title", "price"]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type CreateCourseBody = z.infer<typeof createCourseSchema>;
export type UpdateCourseBody = z.infer<typeof updateCourseSchema>;
export type CourseIdParams = z.infer<typeof courseIdParamsSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;

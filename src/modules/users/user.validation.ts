import { z } from "zod";
import { USER_ROLES } from "./user.types.js";

const userIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must contain at least 2 characters")
  .max(100, "Name cannot exceed 100 characters");

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .max(254, "Email cannot exceed 254 characters")
  .transform((email) => email.toLowerCase());

export const userIdParamsSchema = z
  .object({
    id: userIdSchema,
  })
  .strict();

export const createUserSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
  })
  .strict()
  .refine((input) => input.name !== undefined || input.email !== undefined, {
    message: "At least one field must be provided",
  });

export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    search: z.string().trim().min(1).max(100).optional(),

    role: z.enum(USER_ROLES).optional(),

    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

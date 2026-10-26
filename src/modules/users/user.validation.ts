import { z } from "zod";
import { USER_ROLES } from "./user.types.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID");

export const userIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((email) => email.toLowerCase()),

    role: z.enum(USER_ROLES).optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((email) => email.toLowerCase())
      .optional(),

    role: z.enum(USER_ROLES).optional(),
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  });

export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
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
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

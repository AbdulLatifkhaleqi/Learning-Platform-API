import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../../utils/AppError.js";

export type ValidationSource = "body" | "params" | "query";

const localKeys = {
  body: "validatedBody",
  params: "validatedParams",
  query: "validatedQuery",
} as const;

export const validate = (
  schema: ZodType,
  source: ValidationSource,
): RequestHandler => {
  return (req, res, next): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join("; ");

      next(new AppError(message || "Validation failed", 400));
      return;
    }

    res.locals[localKeys[source]] = result.data;
    next();
  };
};

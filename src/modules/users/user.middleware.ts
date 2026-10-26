import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../../utils/AppError.js";

type ValidationSource = "body" | "params" | "query";

export const validate = (
  schema: ZodType,
  source: ValidationSource,
): RequestHandler => {
  return (req, res, next): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      next(new AppError(message || "Validation failed", 400));
      return;
    }

    res.locals.validated = result.data;
    next();
  };
};

import { Types } from "mongoose";
import { AppError } from "./AppError.js";

export const assertValidId = (id: string, fieldName = "id"): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
};

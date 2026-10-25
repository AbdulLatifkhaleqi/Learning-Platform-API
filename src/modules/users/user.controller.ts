import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError.js";
import * as userService from "./user.service.js";

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.id;

    if (typeof userId !== "string") {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

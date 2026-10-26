import type { Request, Response, NextFunction } from "express";
import * as userService from "./user.service.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserQuery,
} from "./user.types.js";
import type { ListUsersQuery, UpdateUserBody } from "./user.validation.js";

export const createUser = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = res.locals.validated as CreateUserInput;
    const user = await userService.createUser(input);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = res.locals.validated as ListUsersQuery;
    const result = await userService.getAllUsers(query as UserQuery);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const params = res.locals.validated as { id: string };
    const user = await userService.getUserById(params.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const params = res.locals.validated as { id: string };
    const input = res.locals.validated as UpdateUserBody;
    const user = await userService.updateUser(
      params.id,
      input as UpdateUserInput,
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const params = res.locals.validated as { id: string };

    await userService.deleteUser(params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

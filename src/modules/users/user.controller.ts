import type { RequestHandler } from "express";

import * as userService from "./user.service.js";

import type {
  CreateUserBody,
  ListUsersQuery,
  UpdateUserBody,
  UserIdParams,
} from "./user.validation.js";

export const createUser: RequestHandler = async (_req, res, next) => {
  try {
    const input = res.locals.validatedBody as CreateUserBody;

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

export const getAllUsers: RequestHandler = async (_req, res, next) => {
  try {
    const query = res.locals.validatedQuery as ListUsersQuery;

    const result = await userService.getAllUsers(query);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as UserIdParams;

    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as UserIdParams;

    const input = res.locals.validatedBody as UpdateUserBody;

    const user = await userService.updateUser(id, input);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as UserIdParams;

    await userService.deleteUser(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

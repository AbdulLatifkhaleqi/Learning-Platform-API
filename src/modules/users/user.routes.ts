import { Router } from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "./user.controller.js";

import { validate } from "./user.middleware.js";

import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamsSchema,
} from "./user.validation.js";

const userRoutes = Router();

userRoutes
  .route("/")
  .post(validate(createUserSchema, "body"), createUser)
  .get(validate(listUsersQuerySchema, "query"), getAllUsers);

userRoutes
  .route("/:id")
  .get(validate(userIdParamsSchema, "params"), getUserById)
  .patch(
    validate(userIdParamsSchema, "params"),
    validate(updateUserSchema, "body"),
    updateUser,
  )
  .delete(validate(userIdParamsSchema, "params"), deleteUser);

export default userRoutes;

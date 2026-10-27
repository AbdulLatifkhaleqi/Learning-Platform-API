import { Types } from "mongoose";

import { User, type UserDocument } from "./user.model.js";
import { AppError } from "../../utils/AppError.js";

import type {
  CreateUserInput,
  ListUsersInput,
  UpdateUserInput,
} from "./user.types.js";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidUserId = (userId: string): void => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
};

export const createUser = async (input: CreateUserInput) => {
  return User.create({
    name: input.name,
    email: input.email,
  });
};

export const getAllUsers = async (input: ListUsersInput) => {
  const { page, limit, search, role, isActive, sortBy, sortOrder } = input;

  const filter: Record<string, unknown> = {};

  if (role !== undefined) {
    filter.role = role;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");

    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const skip = (page - 1) * limit;
  const direction: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-__v")
      .sort({
        [sortBy]: direction,
        _id: direction,
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),

    User.countDocuments(filter).exec(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getUserById = async (userId: string) => {
  assertValidUserId(userId);

  const user = await User.findById(userId).lean().exec();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateUser = async (userId: string, input: UpdateUserInput) => {
  assertValidUserId(userId);

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: input },
    {
      new: true,
      runValidators: true,
      context: "query",
    },
  )
    .lean()
    .exec();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  assertValidUserId(userId);

  const user = await User.findByIdAndDelete(userId).exec();

  if (!user) {
    throw new AppError("User not found", 404);
  }
};

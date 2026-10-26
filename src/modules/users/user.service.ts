import { Types } from "mongoose";
import { User } from "./user.model.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserQuery,
} from "./user.types.js";

export const createUser = async (input: CreateUserInput) => {
  const existingUser = await User.exists({
    email: input.email,
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  return User.create({
    name: input.name,
    email: input.email,
  });
};

export const getAllUsers = async (query: UserQuery) => {
  const { page, limit, search, role, isActive, sortBy, sortOrder } = query;

  const filter: Record<string, unknown> = {};

  if (role) {
    filter.role = role;
  }

  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortBy]: sortDirection, _id: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
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
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateUser = async (userId: string, input: UpdateUserInput) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (input.email) {
    const existingUser = await User.exists({
      email: input.email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: input },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }
};

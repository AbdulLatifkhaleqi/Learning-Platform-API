import { User } from "./user.model.js";
import type { CreateUserInput, UpdateUserInput } from "./user.types.js";

export const createUser = async (input: CreateUserInput) => {
  return User.create(input);
};

export const getAllUsers = async () => {
  return User.find().select("-password");
};

export const getUserById = async (userId: string) => {
  return User.findById(userId).select("-password");
};

export const updateUser = async (userId: string, input: UpdateUserInput) => {
  return User.findByIdAndUpdate(userId, input, {
    new: true,
    runValidators: true,
  }).select("-password");
};

export const deleteUser = async (userId: string) => {
  return User.findByIdAndDelete(userId).select("-password");
};

import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

import { User } from "../users/user.model.js";
import { AppError } from "../../utils/AppError.js";

import type { LoginInput, RegisterInput, TokenPair } from "./auth.types.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Access and refresh token secrets must be configured");
}

const ACCESS_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] = "15m";
const REFRESH_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] = "7d";

const createTokenPair = (
  userId: string,
  role: "student" | "teacher" | "admin",
): TokenPair => {
  const payload = {
    sub: userId,
    role,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: "learning-platform-api",
    audience: "learning-platform-client",
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: "learning-platform-api",
    audience: "learning-platform-client",
  });

  return { accessToken, refreshToken };
};

export const register = async (input: RegisterInput) => {
  const existingUser = await User.findOne({
    email: input.email,
  })
    .select("_id")
    .lean()
    .exec();

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    const tokens = createTokenPair(user._id.toString(), user.role);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AppError("Email is already registered", 409);
    }

    throw error;
  }
};

export const login = async (input: LoginInput) => {
  const user = await User.findOne({
    email: input.email,
  })
    .select("+passwordHash")
    .exec();

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account is inactive", 403);
  }

  const tokens = createTokenPair(user._id.toString(), user.role);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    ...tokens,
  };
};

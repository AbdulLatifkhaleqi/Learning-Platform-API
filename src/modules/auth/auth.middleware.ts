import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../../utils/AppError.js";

import type {
  AuthenticatedUser,
  AuthRole,
  TokenPayload,
} from "./auth.types.js";

import { AUTH_ROLES } from "./auth.types.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET must be configured");
}

const isTokenPayload = (value: unknown): value is TokenPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.sub === "string" &&
    /^[a-f\d]{24}$/i.test(payload.sub) &&
    typeof payload.role === "string" &&
    AUTH_ROLES.includes(payload.role as (typeof AUTH_ROLES)[number])
  );
};

export const authenticate: RequestHandler = (req, res, next) => {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    next(new AppError("Authentication required", 401));
    return;
  }

  try {
    const decoded: unknown = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: "learning-platform-api",
      audience: "learning-platform-client",
      algorithms: ["HS256"],
    });

    if (!isTokenPayload(decoded)) {
      next(new AppError("Invalid access token", 401));
      return;
    }

    const auth: AuthenticatedUser = {
      userId: decoded.sub,
      role: decoded.role,
    };

    res.locals.auth = auth;
    next();
  } catch {
    next(new AppError("Invalid or expired access token", 401));
  }
};

export const requireRole = (...allowedRoles: AuthRole[]): RequestHandler => {
  return (_req, res, next): void => {
    const auth = res.locals.auth as
      | { userId: string; role: AuthRole }
      | undefined;

    if (!auth?.userId || !auth.role) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(auth.role)) {
      next(new AppError("Insufficient permissions", 403));
      return;
    }

    next();
  };
};

export const AUTH_ROLES = ["student", "teacher", "admin"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export interface AuthenticatedUser {
  userId: string;
  role: AuthRole;
}

export interface TokenPayload {
  sub: string;
  role: AuthRole;
  iat?: number;
  exp?: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

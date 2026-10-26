export const USER_ROLES = ["student", "teacher", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface CreateUserInput {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UserQuery {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy: "createdAt" | "name" | "email";
  sortOrder: "asc" | "desc";
}

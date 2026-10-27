export const USER_ROLES = ["student", "teacher", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UpdateUserInput {
  name?: string | undefined;
  email?: string | undefined;
}

export interface ListUsersInput {
  page: number;
  limit: number;
  search?: string | undefined;
  role?: UserRole | undefined;
  isActive?: boolean | undefined;
  sortBy: "createdAt" | "name" | "email";
  sortOrder: "asc" | "desc";
}
